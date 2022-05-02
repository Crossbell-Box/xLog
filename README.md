## Development

Follow the steps to run it locally.

1. Copy `.env.example` to `.env`
2. Run `postgres` locally, the easiest way on mac is `brew install postgresql`, you can also use docker
3. Install dependencies: `pnpm i`
4. Initialize the database by running `pnpm prisma db push`
5. Start dev server: `pnpm dev`
