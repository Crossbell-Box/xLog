A cloudflare worker based REST API for your R2 bucket.

Usage:

- Change the `bucket_name` and `preview_bucket_name` in `wrangler.toml` if you want.
- Set `ENCRYPT_SECRET` (>= 32 chars) in the worker secrets using Wrangler CLI.

Endpoints:

- GET `/:key`: Public access
- POST `/`: Require `authorization: Bearer TOKEN` header, where `TOKEN` is an encrypted JWT using `@proselog/jwt` and `ENCRYPT_SECRET`. The request content type should be `multipart/form-data` with following fields:
  - `file`: `File` file to upload

The object key is generated from `$userId/` + `uuid()` + `file.extension`
