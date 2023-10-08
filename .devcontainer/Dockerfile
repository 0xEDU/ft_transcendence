FROM node:20-bookworm as repo-setup

WORKDIR /workspaces

COPY package.json .

RUN npm install

COPY . .

FROM node:20-bookworm as pong-front-build

WORKDIR /workspaces/ft_transcendence/packages/pong-front

RUN npm install

FROM node:20-bookworm as pong-api-build

WORKDIR /workspaces/ft_transcendence/packages/pong-api

RUN npm install

FROM node:20-bookworm as deploy

WORKDIR /workspaces/ft_transcendence

RUN apt update && apt install git

CMD [ "sleep", "infinity" ]
