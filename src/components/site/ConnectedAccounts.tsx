import { cn } from "~/lib/utils"

import { Platform } from "./Platform"

export default function ConnectedAccounts({
  connectedAccounts,
  className,
}: {
  connectedAccounts?: (
    | string
    | { uri: string }
    | { identity: string; platform: string }
  )[]
  className?: string
}) {
  return (
    <>
      {!!connectedAccounts?.length && (
        <div className={cn("xlog-social-platforms align-middle", className)}>
          {connectedAccounts.map((account) => {
            let match: RegExpMatchArray | null = null
            switch (typeof account) {
              case "string":
                match = account.match(/:\/\/account:(.*)@(.*)/)
                break
              case "object":
                if ("uri" in account) {
                  match = account.uri.match(/:\/\/account:(.*)@(.*)/)
                } else if (account.identity && account.platform) {
                  match = ["", account.identity, account.platform]
                }
                break
            }
            if (match) {
              return (
                <Platform
                  key={match[2] + match[1]}
                  platform={match[2]}
                  username={match[1]}
                  className="size-4 sm:size-5"
                ></Platform>
              )
            }
          })}
        </div>
      )}
    </>
  )
}
