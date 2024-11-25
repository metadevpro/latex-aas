#!/bin/sh

rm -f output/demo-zip2.pdf
curl localhost:5050/zip?id=demo3 --data-binary @samples/demo3.zip > output/demo3.pdf