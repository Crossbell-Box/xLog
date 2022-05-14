declare interface ServerEnv {
  // Additional environment variables
  APP_NAME: string
  DATABASE_URL: string
  AUTH_COOKIE_NAME: string
  OUR_DOMAIN: string
  MAILGUN_APIKEY: string
  MAILGUN_DOMAIN: string
  FLY_REGION?: string
  PRIMARY_REGION?: string
  ENCRYPT_SECRET: string
  NEXT_PUBLIC_R2_URL: string
  R2_API_TOKEN: string
}

declare interface BrowserEnv {
  APP_NAME: string
  OUR_DOMAIN: string
  S3_CDN_PREFIX: string
}

declare namespace NodeJS {
  interface ProcessEnv extends ServerEnv {}
}
