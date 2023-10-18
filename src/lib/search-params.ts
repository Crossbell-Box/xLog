export default function createSearchParams(
  params: Record<string, string | string[] | number | boolean>,
) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, values]) => {
    if (Array.isArray(values)) {
      values.forEach((value) => {
        searchParams.append(key, value)
      })
    } else {
      searchParams.append(key, values + "")
    }
  })
  return searchParams
}
