import { useLocation } from "@remix-run/react"
import { useMemo } from "react"

export const useRouteQuery = () => {
  const location = useLocation()
  const query = useMemo(() => {
    const search = new URLSearchParams(location.search)
    return Object.fromEntries(search)
  }, [location.search])
  return query
}
