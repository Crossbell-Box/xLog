import React from "react"

import { cn } from "~/lib/utils"

export const BlockchainIcon = ({ className }: { className?: string }) => {
  return (
    <span
      className={cn(
        className,
        "xlog-site-blockchain-icon text-green-600 inline-flex items-center",
      )}
    >
      <i className="i-mingcute-safety-certificate-line text-lg max-w-full max-h-full inline-block" />
    </span>
  )
}
