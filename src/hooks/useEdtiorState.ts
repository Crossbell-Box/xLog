import { create } from "zustand"

export interface Values {
  title: string
  publishedAt: string
  published: boolean
  excerpt: string
  slug: string
  tags: string[]
  content: string
}

export const initialEditorState = {
  title: "",
  publishedAt: new Date().toISOString(),
  published: false,
  excerpt: "",
  slug: "",
  tags: [],
  content: "",
}

export const useEditorState = create<
  Values & {
    setValues: (values: Partial<Values>) => void
  }
>((set) => ({
  ...initialEditorState,
  setValues: (values: any) => set(values),
}))
