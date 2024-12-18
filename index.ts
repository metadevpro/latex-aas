import * as http from "node:http";
import process from "node:process";
import { ping } from "./src/operation/ping.ts";
import { version } from "./src/operation/version.ts";
import { generate, generateFromZip } from "./src/generate.ts";
import { convertMathMLToLatex } from "./src/mathml.ts";
import { deleteFolderOlderThan } from "./src/fs.ts";

const server = http.createServer(
  async (
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>
  ) => {
    const parts = (req.url || "").split("?");
    const path = parts.length > 0 ? parts[0] : "";

    //console.log(req.url);

    switch (path) {
      case "/ping":
        return ping(req, res);
      case "/version":
        return version(req, res);
      case "/pdf":
        await houseKeeping();
        return generate(req, res);
      case "/zip":
        await houseKeeping();
        return generateFromZip(req, res);
      case "/mathml":
        return await convertMathMLToLatex(req, res);
      default:
        return version(req, res);
    }
  }
);

server.listen(process.env.PORT || 5050);
console.log(`arc-latex-be v. 1.0.0 started.`);

const houseKeeping = async (): Promise<void> => {
  const historyDays = +(process.env?.LOG_HISTORY_DAYS || 60);
  await deleteFolderOlderThan(historyDays, "/tmp");
};
