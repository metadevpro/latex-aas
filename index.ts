import * as http from "node:http";
import process from "node:process";
import { ping } from "./src/operation/ping.ts";
import { version } from "./src/operation/version.ts";
import { generate, generateFromZip } from "./src/generate.ts";
import { convertMathMLToLatex } from "./src/mathml.ts";

const server = http.createServer(
  async (
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>
  ) => {
    const url = req.url || "";
    // console.log(url);

    switch (url) {
      case "/ping":
        return ping(req, res);
      case "/version":
        return version(req, res);
      case "/pdf":
        return generate(req, res);
      case "/zip":
        return generateFromZip(req, res);
      case "/mathml":
        return await convertMathMLToLatex(req, res);
      default:
        return version(req, res);
    }
  }
);

server.listen(process.env.PORT || 5050);
console.log(`latex-aas v. 1.0.0 started.`);
