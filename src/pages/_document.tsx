import { Html, Head, Main, NextScript, DocumentProps } from "next/document"
import { EMAIL_TEMPLATE_SEGMENT } from "~/lib/reserved-words"

export default function Document(props: DocumentProps) {
  const isEmailTemplate = props.dangerousAsPath.includes(
    `/${EMAIL_TEMPLATE_SEGMENT}/`
  )
  return (
    <Html>
      <Head>
        {!isEmailTemplate && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin=""
            />
            <link
              href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap"
              rel="stylesheet"
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
