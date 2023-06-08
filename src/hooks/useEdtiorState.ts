import { create } from "zustand"

export const initialEditorState = {
  title: "",
  publishedAt: "",
  published: false,
  excerpt: "",
  slug: "",
  tags: "",
  content: "",
  cover: {
    address: "",
    mime_type: "",
  },
  disableAISummary: false,
}
export type Values = {
  title: string
  publishedAt: string
  published: boolean
  excerpt: string
  slug: string
  tags: string
  content: string
  cover: {
    address?: string
    mime_type?: string
  }
  disableAISummary: boolean
}

export const useEditorState = create<
  Values & {
    setValues: (values: Partial<typeof initialEditorState>) => void
  }
>((set) => ({
  ...initialEditorState,
  setValues: (values: any) => set(values),
}))
