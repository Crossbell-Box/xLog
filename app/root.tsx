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
import css from "./main.css"
import { getAuthUser } from "./lib/auth.server"
import { getTenant } from "./lib/tenant.server"
import { siteController } from "./controllers/site.controller"
import { getSubscription } from "./models/site.model"
import { APP_NAME } from "./lib/config.shared"
import { SiteLayout } from "./components/site/SiteLayout"
import { MainLayout } from "./components/main/MainLayout"

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

type LoaderData =
  | {
      type: "main"
      appName: string
      isLoggedIn: boolean
      ENV: Record<string, string>
    }
  | {
      type: "tenant"
      isLoggedIn: boolean
      appName: string
      tenant?: string
      site: {
        id: string
        name: string
        description: string
        icon?: string | null
      }
      subscription?: {
        telegram?: boolean
        email?: boolean
      } | null
      ENV: Record<string, string>
    }
  | {
      type: "dashboard"
      ENV: Record<string, string>
    }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request)
  const tenant = getTenant(request)
  const env = {
    APP_NAME: process.env.APP_NAME,
    OUR_DOMAIN: process.env.OUR_DOMAIN,
  }

  const isLoggedIn = !!user
  const url = new URL(request.url)
  const isDashboard =
    url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard")

  if (tenant) {
    if (isDashboard) {
      throw new Response("not found", { status: 404 })
    }

    const { site } = await siteController.getSite(tenant)
    const subscription =
      user &&
      (await getSubscription({
        siteId: site.id,
        userId: user.id,
      }))

    return json<LoaderData>({
      type: "tenant",
      isLoggedIn,
      appName: APP_NAME,
      tenant,
      site: {
        id: site.id,
        name: site.name,
        description: site.description || "",
        icon: site.icon,
      },
      subscription: subscription?.config,
      ENV: env,
    })
  }

  if (isDashboard) {
    return json<LoaderData>({
      type: "dashboard",
      ENV: env,
    })
  }

  return json<LoaderData>({
    type: "main",
    isLoggedIn,
    appName: APP_NAME,
    ENV: env,
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
          {data.type === "tenant" ? (
            <SiteLayout
              site={data.site}
              isLoggedIn={data.isLoggedIn}
              subscription={data.subscription}
            >
              <Outlet />
            </SiteLayout>
          ) : data.type === "dashboard" ? (
            <Outlet />
          ) : (
            <MainLayout isLoggedIn={data.isLoggedIn} appName={data.appName}>
              <Outlet />
            </MainLayout>
          )}
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
        <LiveReload />
      </body>
    </html>
  )
}
