import { Buffer } from "node:buffer";
import * as http from "node:http";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import { performance } from "node:perf_hooks";

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

export const getFromQueryString = (
  req: http.IncomingMessage,
  key: string,
  defaultValue: unknown
): unknown => {
  try {
    const index = req.url?.indexOf("?") || -1;
    const query = index == -1 ? undefined : req.url?.substring(index + 1);
    if (!query) {
      return defaultValue;
    }
    const qs = queryString.parse(query);
    const value = qs[key] || undefined;
    return value || defaultValue;
  } catch (err) {
    console.error(err);
    return defaultValue;
  }
};

export const getEllapsedMs = (t0: number): number => {
  const t1 = performance.now();
  return t1 - t0;
};
