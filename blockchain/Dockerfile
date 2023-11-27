FROM node:20.9

RUN npm install -g ganache truffle
RUN apt update && apt install vim -y

EXPOSE 8545

COPY ./tournament /ganache-server/tournament
WORKDIR /ganache-server/tournament
RUN truffle compile
RUN truffle migrate
ENTRYPOINT ["ganache", "--server.host='0.0.0.0'", "--server.port=8545", "--database.dbPath=/ganache-server/ganache-volume"]