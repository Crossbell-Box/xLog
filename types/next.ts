import { NextPage } from "next"
import { AppProps } from "next/app"
import { PropsWithChildren, ReactElement, ReactNode } from "react"

import { DehydratedState } from "@tanstack/react-query"

export type AppPropsWithLayout = AppProps<{
  dehydratedState: DehydratedState
}> & {
  Component: NextPageWithLayout
}

export type NextPageWithLayout<
  P = { dehydratedState: DehydratedState },
  IP = P,
> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

export type NextServerPageBaseParams<
  I extends {} = {},
  P extends PropsWithChildren<any> = PropsWithChildren<{}>,
> = {
  params: {
    locale: string
  } & I
} & P
