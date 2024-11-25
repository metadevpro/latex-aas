import { Buffer } from "node:buffer";
import * as http from "node:http";

export const getBody = (request: http.IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    const bodyParts: Buffer[] = [];

    request.on("error", (error) => {
      console.log(error);
      reject(error);
    });

    request.on("data", (chunk: Buffer) => {
      bodyParts.push(chunk);
    });

    request.on("end", () => {
      const body = Buffer.concat(bodyParts).toString();
      resolve(body);
    });
  });
};

export const replyJson = (
  res: http.ServerResponse<http.IncomingMessage>,
  statusCode: number,
  payload: unknown
): void => {
  res.writeHead(statusCode, "application/json");
  res.end(payload);
};
