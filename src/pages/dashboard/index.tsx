import { redirect } from "~/lib/server-side-props"
import { getUserLastActiveSite } from "~/models/site.model"
import { useAccount } from 'wagmi'
import { useEffect } from "react"
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { data: wagmiData } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (wagmiData?.address) {
      getUserLastActiveSite(wagmiData.address).then((site) => {
        if (!site) {
          router.push(`/dashboard/new-site`)
        }
        router.push(`/dashboard/${site.username}`)
      })
    } else {
      router.push("/")
    }
  })

  return <div>Loading...</div>
}
