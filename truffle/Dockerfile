FROM node:20.10.0-bullseye

COPY tournament /tournament

WORKDIR /tournament

RUN npm install -g truffle

ENTRYPOINT [ "truffle", "migrate" ]