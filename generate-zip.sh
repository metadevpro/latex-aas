#!/bin/sh

rm -f output/demo-zip.pdf
curl localhost:5050/zip?id=4567 --data-binary @tests/samples/examen.zip > tests/output/demo-zip.pdf