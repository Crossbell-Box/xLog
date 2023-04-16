declare module "react" {
  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    "data-hide-print"?: boolean
    "aria-hidden"?: boolean
  }
}

export {}
