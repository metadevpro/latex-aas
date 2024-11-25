import { Buffer } from "node:buffer";
import { performance } from "node:perf_hooks";
import { ConversionProperties } from "./conversion-properties.ts";
import { exec, ExecException } from "node:child_process";
import * as http from "node:http";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import * as fs from "node:fs";
import * as path from "node:path";

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

export const getConvertProperties = (dir: string): ConversionProperties => {
  const props = new ConversionProperties();
  const propFile = path.join(dir, "properties.json");
  if (!fs.existsSync(propFile)) {
    return props;
  }
  const propertiesRaw = fs.readFileSync(propFile).toString();
  const properties = JSON.parse(propertiesRaw);

  if (properties.compilations) {
    props.compilations = Math.min(properties.compilations, 5) ?? 1;
  }
  if (properties.texFileName) {
    props.texFileName = properties.texFileName ?? "examen.tex";
  }
  return props;
};

export interface ExecutionError {
  err: ExecException | null;
  stdout: string;
  stderr: string;
}

export const exec2 = (cmd: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject({
          err,
          stdout,
          stderr
        } as ExecutionError);
      }
      return resolve();
    });
  });
};
