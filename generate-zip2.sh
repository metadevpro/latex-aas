#!/bin/sh

rm -f output/demo-zip2.pdf
curl localhost:5050/zip?id=9876 --data-binary @tests/samples/examen2.zip > tests/output/demo-zip2.pdf