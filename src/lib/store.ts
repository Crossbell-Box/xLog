import create, { StoreApi } from "zustand"
import createContext from "zustand/context"

export type Store = {
  loginModalOpened: boolean
  setLoginModalOpened: (open: boolean) => void

  subscribeModalOpened: boolean
  setSubscribeModalOpened: (open: boolean) => void

  emailPostModalOpened: boolean
  setEmailPostModalOpened: (open: boolean) => void
}

const { Provider, useStore } = createContext<StoreApi<Store>>()

export { useStore }

export const StoreProvider = Provider

export const createStore = () =>
  create<Store>((set) => ({
    loginModalOpened: false,
    setLoginModalOpened(open) {
      set({ loginModalOpened: open })
    },

    subscribeModalOpened: false,
    setSubscribeModalOpened(open) {
      set({ subscribeModalOpened: open })
    },

    emailPostModalOpened: false,
    setEmailPostModalOpened(open) {
      set({ emailPostModalOpened: open })
    },
  }))
