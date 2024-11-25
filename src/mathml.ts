import * as http from "node:http";
import {
  getBody,
  getEllapsedMs,
  getFromQueryString,
  replyJson
} from "./util.ts";
import { performance } from "node:perf_hooks";
import mathml2latex from "npm:mathml-to-latex@^1.4.3";

export const convertMathMLToLatex = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  const t0 = performance.now();
  const id = getFromQueryString(req, "id", "-");
  const body = await getBody(req);
  const mathml = JSON.parse(body).mathml;

  if (!mathml) {
    replyJson(
      res,
      400,
      JSON.stringify({
        error: "No se proporcionó MathML en el cuerpo de la solicitud.",
        id
      })
    );
  }
  let result = 200;
  try {
    const latex = mathml2latex.MathMLToLaTeX.convert(mathml);
    replyJson(res, 200, JSON.stringify({ latex }));
  } catch (err) {
    result = 500;
    console.error("Error converting MathML to LaTeX:", err);
    replyJson(
      res,
      500,
      JSON.stringify({ error: "Error converting MathML to LaTeX.", id })
    );
  } finally {
    const ellapsed = getEllapsedMs(t0);
    console.log(
      `/mathml Id: ${id} ${ellapsed.toFixed(2)} ms Status: ${result}`
    );
  }
};
