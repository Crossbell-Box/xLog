declare interface ServerEnv {
  // Additional environment variables
  APP_NAME: string
  DATABASE_URL: string
  AUTH_COOKIE_NAME: string
  OUR_DOMAIN: string
  S3_REGION: string
  S3_ACCESS_KEY_ID: string
  S3_SECRET_ACCESS_KEY: string
  S3_BUCKET_NAME: string
  S3_ENDPOINT?: string
  MAILGUN_APIKEY: string
  MAILGUN_DOMAIN: string
  S3_CDN_PREFIX: string
  FLY_REGION?: string
  PRIMARY_REGION?: string
  ENCRYPT_SECRET: string
}

declare interface BrowserEnv {
  APP_NAME: string
  OUR_DOMAIN: string
  S3_CDN_PREFIX: string
}

declare namespace NodeJS {
  interface ProcessEnv extends ServerEnv {}
}
