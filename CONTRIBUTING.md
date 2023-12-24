# Contributing

So you want to help? That's great!

Here are a few things to know to get you started on the right path.

Below link will help you making a copy of the repository in your local system.

https://docs.github.com/en/get-started/quickstart/fork-a-repo

## Requirements

- [Node.js](https://nodejs.org) 18.17 or later.
- [pnpm](https://pnpm.io/) package manager.
- [Docker](https://www.docker.com/) for running the cache database.

## Development Installation

Follow the steps below to run it locally for the first time.

1. Copy `.env.example` to `.env`
2. Install dependencies: `pnpm i`
3. Run the databases via docker-compose: `pnpm docker:db`
4. Initialize the databases: `pnpm prisma:migrate:dev`
5. Start dev server: `pnpm dev`

The database is only needed for the first run, afterwards you just need to start the server `pnpm dev`

## Claiming rewards

We will provide some small gifts to contributors as a token of appreciation, currently including the [Honorary Badge](https://xlog.xlog.app/week14-2023#honorary-badges-for-outstanding-contributors) in xLog and special permissions on Discord. In the future, there will be additional rewards such as NFT achievements. Therefore, please do not forget to leave your xLog address and Discord ID when submitting a PR.

## Last words

Don't get daunted if it is hard in the beginning. We have a great community with only encouraging words. So if you get stuck, ask for help and hints in the Discord server. If you want to show off something good, show it off there.

[Join our Discord server if you want closer contact!](https://discord.gg/46VJMMVCuF)
