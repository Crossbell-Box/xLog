declare interface CustomEnv {
  // Additional environment variables
  NEXT_PUBLIC_APP_NAME: string
  NEXT_PUBLIC_R2_URL: string

  DATABASE_URL: string
  AUTH_COOKIE_NAME: string
  NEXT_PUBLIC_OUR_DOMAIN: string
  MAILGUN_APIKEY: string
  MAILGUN_DOMAIN_TRANSANCTION?: string
  MAILGUN_DOMAIN_NEWSLETTER?: string
  FLY_REGION?: string
  PRIMARY_REGION?: string
  ENCRYPT_SECRET: string
}

declare namespace NodeJS {
  interface ProcessEnv extends CustomEnv {}
}
