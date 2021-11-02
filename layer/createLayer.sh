read curdir <<< $(pwd)
docker build --tag layer:latest .
docker run --rm -v ${curdir}:/dest layer:latest cp code.zip /dest/layer.zip
