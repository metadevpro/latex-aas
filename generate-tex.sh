#!/bin/sh

curl localhost:5050/pdf?id=1234 --data-binary @tests/samples/demo.tex > tests/output/demo.pdf
