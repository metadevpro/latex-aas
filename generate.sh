#!/bin/sh

rm -f demo.pdf demo.log demo.fls demo.fdb_latexmk demo.aux demo.synctex.gz 
curl localhost:5050/pdf --data-binary @demo.tex > demo.pdf