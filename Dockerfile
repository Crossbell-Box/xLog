##### BASE
FROM node:18-bullseye-slim as base

RUN apt-get update || : && apt-get install python3 build-essential git -y

RUN corepack enable
RUN npm i -g pm2

##### DEPS
FROM base as deps

WORKDIR /app

COPY package.json pnpm-lock.yaml prisma ./
COPY patches ./patches

ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN pnpm i --frozen-lockfile

##### BUILD
FROM deps as build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_DISCORD_LINK
ENV NEXT_PUBLIC_DISCORD_LINK=${NEXT_PUBLIC_DISCORD_LINK}
ARG NEXT_PUBLIC_GITHUB_LINK
ENV NEXT_PUBLIC_GITHUB_LINK=${NEXT_PUBLIC_GITHUB_LINK}
ARG NEXT_PUBLIC_OUR_DOMAIN
ENV NEXT_PUBLIC_OUR_DOMAIN=${NEXT_PUBLIC_OUR_DOMAIN}
ARG NEXT_PUBLIC_TWITTER_LINK
ENV NEXT_PUBLIC_TWITTER_LINK=${NEXT_PUBLIC_TWITTER_LINK}
ARG NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID
ENV NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID=${NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID}
ARG NEXT_PUBLIC_IPFS_GATEWAY
ENV NEXT_PUBLIC_IPFS_GATEWAY=${NEXT_PUBLIC_IPFS_GATEWAY}

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

ENTRYPOINT [ "pm2-runtime" ]
CMD ["start", "-i", "2", "ecosystem.config.js"]
