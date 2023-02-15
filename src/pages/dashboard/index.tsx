import { useAccountSites } from "~/queries/site"
import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Dashboard() {
  const router = useRouter()
  const userSites = useAccountSites()

  useEffect(() => {
    if (userSites.isSuccess) {
      if (!userSites.data?.length) {
        router.push(`/`)
      } else {
        router.push(`/dashboard/${userSites.data[0].username}`)
      }
    }
  }, [userSites, router])

  return (
    <div className="flex items-center justify-center w-full h-60">
      Loading...
    </div>
  )
}
