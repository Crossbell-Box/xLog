import { SitePage } from "~/components/site/SitePage"

export default async function NotFound() {
  return (
    <>
      {/* @ts-expect-error Async Server Component */}
      <SitePage />
    </>
  )
}
