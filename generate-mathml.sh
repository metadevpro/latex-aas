#!/bin/sh

curl -X POST localhost:5050/mathml?id=abc3 \
   -H "content-type: application/json" \
   -d '{ "mathml": "<math><mfrac><mn>1</mn><msqrt><mn>2</mn></msqrt></mfrac></math>" }'
