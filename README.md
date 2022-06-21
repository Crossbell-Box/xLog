## Development

Follow the steps to run it locally.

1. Copy `.env.example` to `.env`
2. Run `postgres` locally, the easiest way on mac is `brew install postgresql`, you can also use docker

```bash
docker run -d \
	--name mypostgres \
	-e POSTGRES_PASSWORD=pass \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v mypostgres_data:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres
```

3. Install dependencies: `pnpm i`
4. Initialize the database by running `pnpm prisma db push`
5. Start dev server: `pnpm dev`
