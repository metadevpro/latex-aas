import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import { exec } from "node:child_process";
import { replyJson } from "./util.ts";
import { createTempDir } from "./fs.ts";

export const generate = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  const t0 = performance.now();
  const filepath = await Deno.makeTempFile({
    prefix: "job",
    suffix: ""
  });

  const writeStream = fs.createWriteStream(filepath);
  writeStream.on("close", function () {
    // execute pdflatex on that latex source
    const dir = path.dirname(filepath),
      basename = path.basename(filepath, ".tmp");
    exec(
      `pdflatex -interaction=batchmode -output-directory=${dir} ${filepath}`,
      (err, _stdout, stderr) => {
        //
        // if we there are errors respond in plain text
        // explaining what happened
        //
        if (err || stderr) {
          const t1 = performance.now();
          const ellapsedMs = t1 - t0;
          console.log(`! ${filepath} ${ellapsedMs} ms`);
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
        const t1 = performance.now();
        console.log(`< ${filepath} ${t1 - t0} ms`);
        fs.createReadStream(`${path.join(dir, basename)}.pdf`).pipe(res);
      }
    );
  });

  //
  // pipe the body of the request to our tmp file
  //
  console.log(`> ${filepath}`);
  req.pipe(writeStream);
};

export const generateFromZip = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  const t0 = performance.now();
  const filepath = await Deno.makeTempFile({
    prefix: "job",
    suffix: ""
  });

  const writeStream = fs.createWriteStream(filepath);
  writeStream.on("close", function () {
    // execute pdflatex on that latex source
    const dir = path.dirname(filepath),
      basename = path.basename(filepath, ".tmp");
    exec(`unzip ${filepath} -d ${dir}`, (err, _stdout, stderr) => {
      //
      // if we there are errors respond in plain text
      // explaining what happened
      //
      if (err || stderr) {
        const t1 = performance.now();
        const ellapsedMs = t1 - t0;
        console.log(`! ${filepath} ${ellapsedMs} ms`);
        replyJson(
          res,
          500,
          JSON.stringify({
            error: "Error unzipping file " + ((err && err.message) || stderr),
            ellapsedMs
          })
        );
        return;
      }

      const texFilepath = "examen"; // todo: find main.tex

      // const mode = "nonstopmode";
      const mode = "batchmode";

      exec(
        `pdflatex -interaction=${mode} -output-directory=${dir} ${texFilepath}.tex`,
        (err2, _stdout2, stderr2) => {
          //
          // if we there are errors respond in plain text
          // explaining what happened
          //
          if (err2 || stderr2) {
            const t1 = performance.now();
            const ellapsedMs = t1 - t0;
            const errorLog = fs
              .readFileSync(`${path.join(dir, texFilepath)}.log`)
              .toString();
            console.log(`! ${filepath} ${ellapsedMs} ms`);
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
                ellapsedMs
              })
            );
            return;
          }

          //
          // else just send the output pdf as response
          //
          const t1 = performance.now();
          console.log(`< ${filepath} ${t1 - t0} ms`);
          fs.createReadStream(`${path.join(dir, basename)}.pdf`).pipe(res);
        }
      );
    });
  });

  //
  // pipe the body of the request to our tmp file
  //
  console.log(`> ${filepath}`);
  req.pipe(writeStream);
};
