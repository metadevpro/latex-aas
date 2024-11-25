#!/bin/sh

curl localhost:5050/pdf?id=1234 --data-binary @samples/demo.tex > output/demo.pdf
