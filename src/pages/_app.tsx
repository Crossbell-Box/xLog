import { Toaster } from "react-hot-toast"
import LoginModal from "~/components/common/LoginModal"
import "~/css/main.css"
import { StoreProvider, createStore } from "~/lib/store"
import { wrapTrpc } from "~/lib/trpc"

function MyApp({ Component, pageProps }: any) {
  return (
    <StoreProvider createStore={createStore}>
      <Component {...pageProps} />
      <LoginModal />
      <Toaster />
    </StoreProvider>
  )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default wrapTrpc()(MyApp)
