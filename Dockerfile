##### BASE
FROM node:18-bullseye-slim as base

RUN apt-get update || : && apt-get install python3 build-essential git -y

RUN npm i -g pnpm

##### DEPS
FROM base as deps

WORKDIR /app

ADD . .

RUN pnpm i

##### BUILD
FROM deps as build

WORKDIR /app

COPY --from=deps /app /app
COPY ./deploy/env.production .env.production

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV BUILD_STEP=1
RUN pnpm build

##### FINAL
FROM base

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/.next/standalone /app
COPY --from=build /app/public /app/public
COPY --from=build /app/.next/static /app/.next/static
COPY ./deploy/entrypoint.sh .
# to identify all the configuration
COPY ./deploy/env.production .env.production

RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT ["./entrypoint.sh"]
CMD ["pnpm", "start"]

