import { create } from "zustand"

import { EditorValues } from "~/lib/types"

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
  externalUrl: "",
  images: [],
}

export const useEditorState = create<
  EditorValues & {
    setValues: (values: Partial<typeof initialEditorState>) => void
  }
>((set) => ({
  ...initialEditorState,
  setValues: (values: any) => set(values),
}))
