import { create } from "zustand"

export const initialEditorState = {
  title: "",
  publishedAt: new Date().toISOString(),
  published: false,
  excerpt: "",
  slug: "",
  tags: "",
  content: "",
  password: "",
}
export type Values = typeof initialEditorState

export const useEditorState = create<
  typeof initialEditorState & {
    setValues: (values: Partial<typeof initialEditorState>) => void
  }
>((set) => ({
  ...initialEditorState,
  setValues: (values: any) => set(values),
}))
