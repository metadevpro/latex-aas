import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import {
  exec2,
  ExecutionError,
  getConvertProperties,
  getEllapsedMs,
  getFromQueryString,
  replyJson
} from "./util.ts";
import { createTempDir } from "./fs.ts";

const runPdfLatex = async (dir: string, fileName: string): Promise<void> => {
  // const mode = "nonstopmode";
  const mode = "batchmode";
  const cmd = `pdflatex -interaction=${mode} -output-directory=${dir} ${fileName}`;
  await exec2(cmd);
};

export const generate = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  const t0 = performance.now();
  const id = getFromQueryString(req, "id", "-");
  const dir = await createTempDir();

  const basename = `job`;
  const fileName = `${basename}.tex`;
  const filePath = path.join(dir, fileName);
  const pdfFilePath = `${path.join(dir, basename)}.pdf`;

  const writeStream = fs.createWriteStream(fileName);
  writeStream.on("close", async () => {
    // execute pdflatex on that latex source
    try {
      await runPdfLatex(dir, fileName);
    } catch (e) {
      // if we there are errors respond in plain text
      // explaining what happened
      //
      const error = e as ExecutionError;
      if (error.err || error.stderr) {
        const ellapsedMs = getEllapsedMs(t0);
        console.log(`! Id: ${id} ${filePath} ${ellapsedMs} ms`);
        replyJson(
          res,
          500,
          JSON.stringify({
            error: error.err && error.err.message,
            stderr: error.stderr,
            stdout: error.stdout,
            ellapsedMs
          })
        );
        return;
      }

      //
      // else just send the output pdf as response
      //
      const ellapsed = getEllapsedMs(t0);
      console.log(`< Id: ${id} ${pdfFilePath} ${ellapsed.toFixed(2)} ms`);
      fs.createReadStream(pdfFilePath).pipe(res);
    }
  });

  //
  // pipe the body of the request to our tmp file
  //
  console.log(`> Id: ${id} ${filePath}`);
  req.pipe(writeStream);
};

export const generateFromZip = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  const t0 = performance.now();
  const id = getFromQueryString(req, "id", "-");

  const dir = await createTempDir();
  const texBasename = `job`;
  const fileName = `${texBasename}.zip`;
  const filePath = path.join(dir, fileName);

  const writeStream = fs.createWriteStream(filePath);
  writeStream.on("close", async () => {
    try {
      // unzip it
      await exec2(`unzip ${filePath} -d ${dir}`);
    } catch (e) {
      console.error(e);
      const error = e as ExecutionError;
      if (error.err || error.stderr) {
        const ellapsedMs = getEllapsedMs(t0);
        console.log(
          `! Error unzipping file Id: ${id} ${filePath} ${ellapsedMs.toFixed(
            2
          )} ms`
        );
        replyJson(
          res,
          500,
          JSON.stringify({
            error: "Error unzipping file " + (error.err && error.err.message),
            stderr: error.stderr,
            stdout: error.stdout,
            ellapsedMs,
            id
          })
        );
        return;
      }
    }

    //read properties.
    const properties = getConvertProperties(dir);
    const ext = path.extname(properties.texFileName);
    const baseName = path.basename(properties.texFileName).replace(ext, "");

    const texFilePath = path.join(dir, `${baseName}.tex`);
    const pdfFilePath = path.join(dir, `${baseName}.pdf`);

    for (let i = 0; i < properties.compilations; i++) {
      const ta = performance.now();
      let errorLevel = 0;
      try {
        await runPdfLatex(dir, `${baseName}.tex`);
      } catch (e) {
        //
        // if we there are errors respond in plain text
        // explaining what happened
        //
        const error = e as ExecutionError;
        if (error.err || error.stderr) {
          const ellapsedMs = getEllapsedMs(t0);
          const errorLog = fs
            .readFileSync(`${path.join(dir, baseName)}.log`)
            .toString();
          console.log(
            `! Id: ${id} ${texFilePath}.log ${ellapsedMs.toFixed(2)} ms`
          );
          errorLevel = error.err?.code || 0;
          replyJson(
            res,
            500,
            JSON.stringify({
              error: error.err && error.err.message,
              stderr: error.stderr,
              stdout: error.stdout,
              code: error.err!.code,
              killed: error.err!.killed,
              signal: error.err!.signal,
              cmd: error.err!.cmd,
              errorLog,
              ellapsedMs,
              id
            })
          );
          console.log(
            `Id: ${id} Compilation ${i + 1} Errorlevel: ${errorLevel}`
          );
          return;
        }
      }
      const ellapsedMs = getEllapsedMs(ta);
      console.log(
        `Id: ${id} Compilation ${
          i + 1
        } Errorlevel: ${errorLevel} ${ellapsedMs.toFixed(2)} ms`
      );
    }
    //
    // else just send the output pdf as response
    //
    const ellapsedMs = getEllapsedMs(t0);
    console.log(`< Id: ${id} ${pdfFilePath} ${ellapsedMs.toFixed(2)} ms`);
    fs.createReadStream(`${path.join(dir, baseName)}.pdf`).pipe(res);
  });
  //
  // pipe the body of the request to our tmp file
  //
  console.log(`> Id: ${id}`);
  req.pipe(writeStream);
};
