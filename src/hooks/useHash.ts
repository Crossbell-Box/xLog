import { useCallback, useEffect, useState } from "react"

export function useHash() {
  const [hash, setHash] = useState("")

  const onHashChange = useCallback(() => {
    setHash(window.location.hash)
  }, [])

  useEffect(() => {
    setHash(window.location.hash)
  }, [])

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange)
    return () => {
      window.removeEventListener("hashchange", onHashChange)
    }
  })

  return hash
}
