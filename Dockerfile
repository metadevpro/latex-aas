FROM ubuntu:24.10
ENV DEBIAN_FRONTEND="noninteractive"
ARG INSTALL_EXTRA_PACKAGES

EXPOSE 5050
WORKDIR /opt/pdflatex

# install texlive 
RUN apt-get update -qqy && \
    apt-get install -y --no-install-recommends \
        curl \
        unzip \
        ca-certificates \
        texlive-font-utils \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-latex-base \
        texlive-latex-extra \
        texlive-latex-recommended \
        texlive-lang-spanish
        
# texlive-full 
# ${INSTALL_EXTRA_PACKAGES} 

# install deno
RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y

COPY deno.json .
COPY index.ts .
COPY src/ src/
RUN /root/.deno/bin/deno install

CMD ["/root/.deno/bin/deno", "--allow-run", "--allow-net", "--allow-env", "--allow-write", "--allow-read", "/opt/pdflatex/index.ts"]

# CMD ["sleep", "1000000"]