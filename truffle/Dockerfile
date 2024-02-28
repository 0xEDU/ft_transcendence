# Install pnpm
FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# Migrate Ganache
FROM base as deploy

COPY tournament /tournament

WORKDIR /tournament

RUN pnpm install -g truffle

ENTRYPOINT [ "truffle", "migrate" ]
