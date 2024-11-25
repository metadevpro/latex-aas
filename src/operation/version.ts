import * as http from "node:http";

export const version = (
  _req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      name: "arc-latex-be",
      version: "1.0.0",
      ts: new Date().toISOString()
    })
  );
};
