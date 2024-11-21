#!/bin/sh

curl localhost:5050/pdf --data-binary @demo.tex > output/demo.pdf
