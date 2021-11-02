FROM lambci/lambda:build-python3.7

WORKDIR /usr/src/package/python

# Copy files
COPY requirements.txt /usr/src/package

# Pip install
RUN pip install -r ../requirements.txt --target .

# packaging
RUN rm /usr/src/package/python/code.zip; echo "deleting zip if exists"
RUN cd /usr/src/package/; zip -r9q ../code.zip .
RUN mv /usr/src/code.zip /usr/src/package/python
