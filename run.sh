#!/bin/sh
# then run
docker rm latex --force && \
 docker run -d --name latex -p "5050:80" latex-aas
