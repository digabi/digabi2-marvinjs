FROM node:18.17.0 AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm clean-install

FROM node:18.17.0 AS build

WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY server server
COPY tsconfig.json .
RUN npx tsc --project server

FROM hub.chemaxon.com/cxn-docker-release/chemaxon/mjs-webservice:latest

ARG CHEMAXON_LICENSE_SERVER_KEY
ENV CHEMAXON_LICENSE_SERVER_KEY=$CHEMAXON_LICENSE_SERVER_KEY

WORKDIR /app

USER root
ENV DEBIAN_FRONTEND=noninteractive
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

USER cxnapp
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY bin bin
#ENTRYPOINT ["/app/mjs-webservice/run-mjs-webservice"]
ENTRYPOINT ["/app/bin/marvinjs"]
