#!/bin/sh

curl localhost:5050/pdf?id=1234 --data-binary @demo.tex > output/demo.pdf
