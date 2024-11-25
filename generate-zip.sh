#!/bin/sh

rm -f output/demo-zip.pdf
curl localhost:5050/zip/1234 --data-binary @samples/examen.zip > output/demo-zip.pdf