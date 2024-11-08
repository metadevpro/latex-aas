const http = require("http"),
  fs = require("fs"),
  tmp = require("tmp"),
  path = require("path"),
  performance = require("perf_hooks").performance;
exec = require("child_process").exec;

const version = (_, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      name: "latex-ass",
      version: "1.0.0",
      ts: new Date().toISOString(),
    })
  );
};
const ping = (_, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "pong" }));
};
const generate = (req, res) => {
  const t0 = performance.now();
  tmp.file((err, filepath) => {
    // if we have problems creating a simple temp file then its
    // better not to do anything at all
    if (err) throw err;

    var writeStream = fs.createWriteStream(filepath);
    writeStream.on("close", function () {
      // execute pdflatex on that latex source
      var dir = path.dirname(filepath),
        basename = path.basename(filepath, ".tmp");
      exec(
        `pdflatex -interaction=batchmode -output-directory=${dir} ${filepath}`,
        (err, stdout, stderr) => {
          //
          // if we there are errors respond in plain text
          // explaining what happened
          //
          if (err || stderr) {
            const t1 = performance.now();
            const ellapsedMs = t1 - t0;
            console.log(`! ${filepath} ${ellapsedMs} ms`);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: (err && err.message) || stderr,
                ellapsedMs,
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
  });
};

const server = http.createServer((req, res) => {
  const url = req.url || "";
  console.log(url);
  switch (url) {
    case "/ping":
      return ping(req, res);
    case "/version":
      return version(req, res);
    case "/pdf":
      return generate(req, res);
    default:
      return version(req, res);
  }
});

//
server.listen(process.env.PORT || 5050);
console.log(`latex-aas v. 1.0.0 started.`);
