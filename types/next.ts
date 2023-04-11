import { DehydratedState } from "@tanstack/react-query"
import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"

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
