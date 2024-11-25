#!/bin/sh
# build with custom packages
docker build -t arc-latex-be \
   --build-arg=INSTALL_EXTRA_PACKAGES="texlive-lang-spanish texlive-fonts-recommended" \
   .
