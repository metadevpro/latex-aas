import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import { exec } from "node:child_process";
import { getEllapsedMs, getFromQueryString, replyJson } from "./util.ts";
import { createTempDir } from "./fs.ts";

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
  writeStream.on("close", function () {
    // execute pdflatex on that latex source
    exec(
      `pdflatex -interaction=batchmode -output-directory=${dir} ${fileName}`,
      (err, _stdout, stderr) => {
        //
        // if we there are errors respond in plain text
        // explaining what happened
        //
        if (err || stderr) {
          const ellapsedMs = getEllapsedMs(t0);
          console.log(`! Id: ${id} ${filePath} ${ellapsedMs} ms`);
          replyJson(
            res,
            500,
            JSON.stringify({
              error: (err && err.message) || stderr,
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
    );
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
  const basename = `job`;
  const fileName = `${basename}.zip`;
  const filePath = path.join(dir, fileName);

  const writeStream = fs.createWriteStream(filePath);
  writeStream.on("close", function () {
    // unzip it
    exec(`unzip ${filePath} -d ${dir}`, (err, _stdout, stderr) => {
      //
      // if we there are errors respond in plain text
      // explaining what happened
      //
      if (err || stderr) {
        const ellapsedMs = getEllapsedMs(t0);
        console.log(`! Id: ${id} ${filePath} ${ellapsedMs.toFixed(2)} ms`);
        replyJson(
          res,
          500,
          JSON.stringify({
            error: "Error unzipping file " + ((err && err.message) || stderr),
            ellapsedMs,
            id
          })
        );
        return;
      }

      // todo: read properties.
      const compileTimes = 1;
      const texFileName = "examen"; // todo: find main.tex

      const texFilePath = path.join(dir, `${texFileName}.tex`);
      const pdfFilePath = path.join(dir, `${texFileName}.pdf`);

      // const mode = "nonstopmode";
      const mode = "batchmode";

      exec(
        `pdflatex -interaction=${mode} -output-directory=${dir} ${texFileName}.tex`,
        (err2, _stdout2, stderr2) => {
          //
          // if we there are errors respond in plain text
          // explaining what happened
          //
          if (err2 || stderr2) {
            const ellapsedMs = getEllapsedMs(t0);
            const errorLog = fs
              .readFileSync(`${path.join(dir, texFileName)}.log`)
              .toString();
            console.log(
              `! Id: ${id} ${texFilePath}.log ${ellapsedMs.toFixed(2)} ms`
            );
            replyJson(
              res,
              500,
              JSON.stringify({
                error: (err2 && err2.message) || stderr2,
                code: err2!.code,
                killed: err2!.killed,
                signal: err2!.signal,
                cmd: err2!.cmd,
                errorLog,
                ellapsedMs,
                id
              })
            );
            return;
          }

          //
          // else just send the output pdf as response
          //
          const ellapsedMs = getEllapsedMs(t0);
          console.log(`< Id: ${id} ${pdfFilePath} ${ellapsedMs.toFixed(2)} ms`);
          fs.createReadStream(`${path.join(dir, basename)}.pdf`).pipe(res);
        }
      );
    });
  });

  //
  // pipe the body of the request to our tmp file
  //
  console.log(`> Id: ${id}`);
  req.pipe(writeStream);
};
