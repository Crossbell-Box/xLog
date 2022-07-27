import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { useGetUserSites } from "~/queries/site"
import { useAccount } from "wagmi"
import { Avatar } from "~/components/ui/Avatar";

export const ConnectButton = () => {
  const { data: viewer } = useAccount()
  const userSites = useGetUserSites(viewer?.address)

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <button className="text-indigo-600" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }
              return (
                <div className="flex" style={{ gap: 12 }}>
                  <button className="flex items-center" onClick={openAccountModal} type="button">
                    <Avatar
                      className="align-middle mr-2"
                      images={userSites.data?.[0]?.avatars || []}
                      name={userSites.data?.[0]?.name}
                      size={30}
                    />
                    <div className="flex flex-col">
                      <span className="text-left leading-none text-gray-600 font-bold" style={{ "marginBottom": "0.15rem" }}>{userSites.data?.[0]?.name || account.displayName}</span>
                      <span className="text-left leading-none text-xs text-gray-400">{"@" + userSites.data?.[0]?.username || account.displayName}</span>
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};