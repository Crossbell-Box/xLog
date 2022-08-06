// @ts-nocheck
globalThis._singletons = globalThis._singletons || {}

export const singleton = <T>(id: string, factory: () => T): T => {
  if (!globalThis._singletons[id]) {
    globalThis._singletons[id] = factory()
  }
  return globalThis._singletons[id]
}

export const singletonAsync = <T>(
  id: string,
  factory: () => Promise<T>,
  enableSingleton = true,
): { readonly value: T; wait: Promise<void> } => {
  if (globalThis._singletons[id] && enableSingleton) {
    return {
      wait: Promise.resolve(),

      get value() {
        return globalThis._singletons[id]
      },
    }
  }

  let ready = false

  const wait = factory().then((value) => {
    ready = true
    globalThis._singletons[id] = value
  })

  return {
    wait,

    get value() {
      if (!ready) {
        throw new Error(`please await .wait before using the value of '${id}'`)
      }
      return globalThis._singletons[id]
    },
  }
}
