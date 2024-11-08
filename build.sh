#!/bin/sh
# build with custom packages
docker build -t latex-aas \
   --build-arg=INSTALL_EXTRA_PACKAGES="texlive-lang-spanish texlive-fonts-recommended" \
   .
