#!/bin/sh

rm -f output/demo-zip.pdf
curl localhost:5050/zip/asd2312 --data-binary @samples/examen2.zip > output/demo-zip2.pdf