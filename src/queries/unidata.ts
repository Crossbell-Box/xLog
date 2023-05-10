"use client"

import { useEffect, useState } from "react"
import type Unidata from "unidata.js"
import { useAccount } from "wagmi"

import { IPFS_GATEWAY } from "../lib/env"

export const useUnidata = () => {
  const { connector, isConnected } = useAccount()

  const [unidata, setUnidata] = useState<Unidata>()

  useEffect(() => {
    import("unidata.js").then(({ default: Unidata }) => {
      if (isConnected && connector) {
        connector?.getProvider().then((provider) => {
          console.log("provider", provider)
          setUnidata(
            new Unidata({
              ethereumProvider: provider,
              ipfsGateway: IPFS_GATEWAY,
              ipfsRelay: "https://ipfs-relay.crossbell.io/json?gnfd=t",
            }),
          )
        })
      } else {
        setUnidata(
          new Unidata({
            ipfsGateway: IPFS_GATEWAY,
            ipfsRelay: "https://ipfs-relay.crossbell.io/json?gnfd=t",
          }),
        )
      }
    })
  }, [isConnected, connector])

  return unidata
}
