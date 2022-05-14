A cloudflare worker based REST API for your R2 bucket.

Usage:

- Change the `bucket_name` and `preview_bucket_name` in `wrangler.toml` if you want.
- Set `API_TOKEN` in the worker secrets using Wrangler CLI.

Endpoints:

- GET `/:key`: Public access
- POST `/`: Require `authorization: Bearer TOKEN` header, where `TOKEN` should match `API_TOKEN` from your worker secrets. The request content type should be `multipart/form-data` with following fields:
  - `prefix`: optional prefix for the key, see blow
  - `file`: `File` file to upload

The object key is generated from `prefix` + `uuid()` + `file.extension`
