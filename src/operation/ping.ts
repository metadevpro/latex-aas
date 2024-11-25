import * as http from "node:http";

export const ping = (
  _req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "pong" }));
};
