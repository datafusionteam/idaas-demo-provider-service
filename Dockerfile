FROM node:14.17 as base

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node src ./src

RUN yarn install --frozen-lockfile
RUN /usr/local/bin/node-prune

FROM base as development

ENV NODE_ENV=development

EXPOSE 8080

CMD ["yarn", "dev"]

FROM node:14.17-alpine3.14 as production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/package.json .
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/src ./src

EXPOSE 8080

CMD ["yarn", "start"]
