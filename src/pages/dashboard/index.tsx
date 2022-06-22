import { redirect } from "~/lib/server-side-props"
import { getUserSites } from "~/models/site.model"
import { useAccount } from 'wagmi'
import { useEffect } from "react"
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { data: wagmiData } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (wagmiData?.address) {
      getUserSites(wagmiData.address).then((sites) => {
        if (!sites) {
          router.push(`/dashboard/new-site`)
        } else {
          router.push(`/dashboard/${sites[0].username}`)
        }
      })
    } else {
      router.push("/")
    }
  }, [wagmiData?.address, router])

  return <div>Loading...</div>
}
