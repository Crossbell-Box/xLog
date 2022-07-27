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
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={openAccountModal} type="button">
                    <Avatar
                      className="align-middle mr-2"
                      images={userSites.data?.[0]?.avatars || []}
                      name={userSites.data?.[0]?.name}
                      size={22}
                    />
                    <span className="align-middle">{userSites.data?.[0]?.name || account.displayName}</span>
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