import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { SEOHead } from "~/components/common/SEOHead"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { useAccount, useBalance } from "wagmi"
import { useCreateSite } from "~/queries/site"
import { BigNumber } from "ethers"
import { UniLink } from "~/components/ui/UniLink"
import { useGetUserSites } from "~/queries/site"
import { getSite } from "~/models/site.model"

export default function NewSitePage() {
  const router = useRouter()
  const createSite = useCreateSite()

  const [addressIn, setAddressIn] = useState<string>("")
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const [balanceFormatted, setBalanceFormatted] = useState<string>("")

  const [InsufficientBalance, setInsufficientBalance] = useState<boolean>(true)

  const userSites = useGetUserSites(address)

  useEffect(() => {
    if (userSites.isSuccess) {
      if (userSites.data?.length) {
        router.push(`/dashboard/${userSites.data[0].username}`)
      }
    }
  }, [userSites, router])

  useEffect(() => {
    if (balance !== undefined) {
      setBalanceFormatted(balance.formatted)
      if (
        BigNumber.from(balance.value).gt(
          BigNumber.from("1" + "0".repeat(balance.decimals - 2)),
        )
      ) {
        setInsufficientBalance(false)
      } else {
        setInsufficientBalance(true)
      }
    }
  }, [balance])

  useEffect(() => {
    if (address) {
      setAddressIn(address || "")
    } else {
      router.push("/")
    }
  }, [address, router])

  const form = useForm({
    defaultValues: {
      name: "",
      subdomain: "",
    },
  })

  const checkIfHandleExists = async (handle: string) => {
    try {
      const owner = await getSite(handle)

      if (owner) {
        return true
      } else {
        return false
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`)
    }
  }

  const [checkLoading, setCheckLoading] = useState<boolean>(false)
  const handleSubmit = form.handleSubmit(async (values) => {
    setCheckLoading(true)
    if (!/^[a-z0-9\-\_]*$/.test(values.subdomain)) {
      toast.error(
        "Handle must be alphanumeric and contain only dashes and underscores.",
      )
      setCheckLoading(false)
      return
    }
    if (!(values.subdomain.length >= 3 && values.subdomain.length <= 31)) {
      toast.error("Handle must be between 3 and 31 characters long.")
      setCheckLoading(false)
      return
    }

    if (await checkIfHandleExists(values.subdomain)) {
      toast.error("Handle already exists.")
      setCheckLoading(false)
      return
    }
    createSite.mutate({
      address: address!,
      payload: values,
    })
    setCheckLoading(false)
  })

  useEffect(() => {
    if (createSite.isSuccess) {
      if (createSite.data?.code === 0) {
        router.push(`/dashboard/${createSite.variables?.payload.subdomain}`)
      } else {
        toast.error("Failed to create site" + ": " + createSite.data.message)
      }
    } else if (createSite.isError) {
      toast.error("Failed to create site")
    }
  }, [createSite, router])

  return (
    <>
      <SEOHead title="New Site" siteName={APP_NAME} />
      <div>
        <header className="px-5 text-sm  md:px-14 flex justify-between items-start py-10">
          <button onClick={() => router.back()}>
            <a className="flex space-x-1 items-center">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back</span>
            </a>
          </button>
          <div>
            <div className="text-zinc-400">Logged in as:</div>
            <div>{addressIn}</div>
          </div>
        </header>
        <div className="max-w-sm mx-auto mt-20">
          <h2 className="text-3xl mb-8 text-center">Create a new site</h2>
          <p className="mb-8 text-gray-500">
            After creating your own site, you can start writing your blog and
            interacting with other bloggers.
          </p>
          {InsufficientBalance ? (
            <p className="mb-8 text-red-400">
              Your $CSB balance ({balanceFormatted}) may not be sufficient,
              please go to{" "}
              <UniLink
                href="https://faucet.crossbell.io/"
                className="font-bold text-red-500"
              >
                Crossbell faucet
              </UniLink>{" "}
              to get some free $CSB.
            </p>
          ) : (
            ""
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Input
                id="name"
                label="Site Name"
                isBlock
                required
                maxLength={30}
                {...form.register("name", {})}
              />
            </div>
            <div>
              <Input
                id="subdomain"
                label="Subdomain"
                isBlock
                required
                addon={`.${OUR_DOMAIN}`}
                minLength={3}
                maxLength={26}
                {...form.register("subdomain", {})}
              />
            </div>
            <div>
              <Button
                type="submit"
                isBlock
                isLoading={checkLoading || createSite.isLoading}
              >
                Create
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
