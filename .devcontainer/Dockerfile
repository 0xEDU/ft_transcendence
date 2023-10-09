FROM node:20-bookworm as repo-setup

WORKDIR /workspaces

COPY package.json .

RUN npm install

COPY . .

FROM node:20-bookworm as client-build

WORKDIR /workspaces/ft_transcendence/packages/client

RUN npm install

FROM node:20-bookworm as api-build

WORKDIR /workspaces/ft_transcendence/packages/api

RUN npm install

FROM node:20-bookworm as deploy

WORKDIR /workspaces/ft_transcendence

RUN apt update && apt install git

CMD [ "sleep", "infinity" ]
