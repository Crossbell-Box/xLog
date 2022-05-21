import {
  GetServerSidePropsContext,
  GetServerSideProps,
  GetServerSidePropsResult,
} from "next"

class Redirect extends Error {
  constructor(public url: string) {
    super("")
  }
}

class NotFound extends Error {}

export const redirect = (url: string) => new Redirect(url)

export const notFound = (message?: string) => new NotFound(message)

export const isNotFoundError = (error: unknown) => error instanceof NotFound

export const serverSidePropsHandler = <
  TProps extends { [key: string]: any } = { [key: string]: any }
>(
  fn: (
    ctx: GetServerSidePropsContext
  ) => Promise<{ props: TProps } | Redirect | NotFound>
) => {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<TProps>> => {
    try {
      const result = await fn(ctx)
      if (result instanceof Redirect) {
        return {
          redirect: {
            destination: result.url,
            permanent: false,
          },
        }
      }
      if (result instanceof NotFound) {
        return {
          notFound: true,
        }
      }
      return result
    } catch (error: any) {
      console.log("serverSidePropsHandler error", error)
      const actualError = error.cause || error
      if (actualError instanceof Redirect) {
        return {
          redirect: {
            destination: actualError.url,
            permanent: false,
          },
        }
      }
      if (actualError instanceof NotFound) {
        return {
          notFound: true,
        }
      }
      ctx.res.statusCode = 500
      return {
        props: {
          // @ts-expect-error
          error: error.message,
        },
      }
    }
  }
}
