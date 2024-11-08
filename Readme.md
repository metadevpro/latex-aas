# LaTeX as a service

Provides a pdflatex compiler as an endpoint in a container.

Exposes a `POST` endpoint on `container:5050/` to send a TeX file.
It will compile it with `pdftex` and will return the final PDF.

Adapted from <https://github.com/comsolid/pdflatex-saas>

## Endpoints

- `GET /ping`  will respond `{ "message" : "pong" }` in JSON form.
- `GET /version`  will respond `{ "version" : "1.0" }`
- `POST /pdf`  will respond a PDF file or errors.

## Commands

### Build image

```bash
docker build -t latex-aas \
   --build-arg=INSTALL_EXTRA_PACKAGES="texlive-lang-spanish texlive-fonts-recommended" \
   .
```

### Run container

```bash
docker run -d --name latex -p "5050:5050" latex-aas
```

### Usage: Compile LaTeX to PDF

```bash
curl localhost:5050/pdf --data-binary @demo.tex > demo.pdf
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
