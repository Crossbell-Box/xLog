import {
  json,
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"
import LoginModal from "~/components/common/LoginModal"
import { createStore, StoreProvider } from "./lib/store"
import { Toaster } from "react-hot-toast"
import css from "./generated.css"
import { APP_NAME } from "./lib/config.shared"

export const meta: MetaFunction = () => {
  return {
    charset: "utf-8",
    title: APP_NAME,
    viewport: "width=device-width,initial-scale=1",
  }
}

export const links: LinksFunction = () => {
  return [{ href: css, rel: "stylesheet", type: "text/css" }]
}

type LoaderData = { ENV: Record<string, string> }

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    ENV: {
      APP_NAME: process.env.APP_NAME,
      OUR_DOMAIN: process.env.OUR_DOMAIN,
    },
  })
}

export default function App() {
  const data = useLoaderData<LoaderData>()

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <StoreProvider createStore={createStore}>
          <Outlet />
          <LoginModal />
        </StoreProvider>

        <Toaster />

        <ScrollRestoration />

        <script
          dangerouslySetInnerHTML={{
            __html: `ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        {/* TODO: implement LiveReload in our express server */}
        {/* <LiveReload /> */}
      </body>
    </html>
  )
}
