### base
FROM node:16-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

### build
FROM base as build

RUN mkdir /app
WORKDIR /app

RUN npm i -g pnpm

ADD . .
RUN pnpm install

ENV NODE_ENV=production

RUN pnpm prisma generate
RUN pnpm build
# keep production dependencies only
RUN pnpm prune --production

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

CMD ["npm", "start"]
