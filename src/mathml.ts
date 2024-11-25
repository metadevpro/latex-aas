import * as http from "node:http";
import { getBody, replyJson } from "./util.ts";
import { performance } from "node:perf_hooks";
import mathml2latex from "npm:mathml-to-latex@^1.4.3";

export const convertMathMLToLatex = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  const t0 = performance.now();
  const body = await getBody(req);
  const mathml = JSON.parse(body).mathml;

  if (!mathml) {
    replyJson(
      res,
      400,
      JSON.stringify({
        error: "No se proporcionó MathML en el cuerpo de la solicitud."
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
      JSON.stringify({ error: "Error converting MathML to LaTeX." })
    );
  } finally {
    const t1 = performance.now();
    console.log(`/mathml ${t1 - t0} ms Status: ${result}`);
  }
};
