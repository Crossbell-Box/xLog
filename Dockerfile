##### BASE
FROM node:18-bullseye-slim as base

RUN apt-get update || : && apt-get install python3 build-essential git -y

RUN npm i -g pnpm pm2

##### DEPS
FROM base as deps

WORKDIR /app

ADD . .

RUN pnpm i

##### BUILD
FROM deps as build

WORKDIR /app

COPY --from=deps /app /app

ARG NEXT_PUBLIC_DISCORD_LINK
ENV NEXT_PUBLIC_DISCORD_LINK ${NEXT_PUBLIC_DISCORD_LINK}
ARG NEXT_PUBLIC_GITHUB_LINK
ENV NEXT_PUBLIC_GITHUB_LINK ${NEXT_PUBLIC_GITHUB_LINK}
ARG NEXT_PUBLIC_OUR_DOMAIN
ENV NEXT_PUBLIC_OUR_DOMAIN ${NEXT_PUBLIC_OUR_DOMAIN}
ARG NEXT_PUBLIC_TWITTER_LINK
ENV NEXT_PUBLIC_TWITTER_LINK ${NEXT_PUBLIC_TWITTER_LINK}
ARG SENTRY_ORG
ENV SENTRY_ORG ${SENTRY_ORG}
ARG SENTRY_PROJECT
ENV SENTRY_PROJECT ${SENTRY_PROJECT}
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN ${NEXT_PUBLIC_SENTRY_DSN}
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}

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
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/ecosystem.config.js /app/ecosystem.config.js

CMD ["pm2-runtime", "start", "-i", "2", "ecosystem.config.js"]
