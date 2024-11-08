FROM ubuntu:24.10
ENV DEBIAN_FRONTEND="noninteractive"
ARG INSTALL_EXTRA_PACKAGES

EXPOSE 5050
WORKDIR /opt/pdflatex

# install texlive 
RUN apt-get update -qqy && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        texlive-latex-base \
        texlive-latex-extra \
        ${INSTALL_EXTRA_PACKAGES} 

# install nodejs v6 
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Optional: install build tools 
# To compile and install native addons from npm you may also need to install build tools: 
RUN npm -g update npm
COPY package.json .
RUN npm install
COPY index.js .

CMD ["node", "/opt/pdflatex/index.js"]
