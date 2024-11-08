# LaTeX as a service

Provides a pdflatex compiler as an endpoint in a container.

Exposes a `POST` endpoint on `container:80/` to send a TeX file.
It will compile it with `pdftex` and will return the final PDF.

Adapted from <https://github.com/comsolid/pdflatex-aas>

## Commands

### Build image

```bash
docker build -t latex-aas \
   --build-arg=INSTALL_EXTRA_PACKAGES="texlive-lang-spanish texlive-fonts-recommended" \
   .
```

### Run container

```bash
docker run -d --name latex -p "5050:80" latex-aas
```

### Usage: Compile LaTeX to PDF

```bash
curl localhost:5050 --data-binary @demo.tex > demo.pdf
```

### Remove container

```bash
docker rm latex --force
```

## Dependencies

- Ubuntu 24.10
- pdflatex
- node 20

## License

GNU GENERAL PUBLIC LICENSE, GPL-3.0

(c) [Metadev](https://metadev.pro), 2024.
