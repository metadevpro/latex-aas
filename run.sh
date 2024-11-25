#!/bin/sh
# then run
docker rm latex --force && \
 docker run -d --name latex -p "5050:5050" arc-latex-be
