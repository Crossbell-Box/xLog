import { useEffect, useState } from "react"

export const FormattedNumber = ({ value }: { value: number }) => {
  const [formatted, setFormatted] = useState<string>("")
  useEffect(() => {
    setFormatted(
      new Intl.NumberFormat(navigator.language, { notation: "compact" }).format(
        value,
      ),
    )
  }, [value])

  return <span>{formatted || value}</span>
}
