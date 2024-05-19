import { useDebounceEffect } from "ahooks"
import type { Root } from "hast"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { BundledTheme } from "shiki/themes"

import { EditorView } from "@codemirror/view"

import MarkdownContent from "~/components/common/MarkdownContent"
import { toolbarShortcuts } from "~/components/dashboard/toolbars"
import { editorUpload } from "~/components/dashboard/toolbars/Multimedia"
import CodeMirror from "~/components/ui/CodeMirror"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { cn } from "~/lib/utils"
import { renderPageContent } from "~/markdown"

export default function DualColumnEditor({
  initialContent,
  onChange,
  onCreateEditor,
  isRendering,
  setIsRendering,
  codeTheme,
}: {
  initialContent: string
  onChange: (value: string) => void
  onCreateEditor: (view: EditorView) => void
  isRendering: boolean
  setIsRendering: (value: boolean) => void
  codeTheme?: {
    light?: BundledTheme
    dark?: BundledTheme
  }
}) {
  const isMobileLayout = useIsMobileLayout()
  const t = useTranslations()

  const [currentScrollArea, setCurrentScrollArea] = useState<string>("")
  const [view, setView] = useState<EditorView>()
  const [tree, setTree] = useState<Root | null>()
  const [values, setValues] = useState("")

  // preview
  const [parsedContent, setParsedContent] = useState<
    ReturnType<typeof renderPageContent> | undefined
  >()

  useEffect(() => {
    setValues(initialContent)
  }, [initialContent])

  useDebounceEffect(
    () => {
      const result = renderPageContent({
        content: values,
        strictMode: true,
        codeTheme,
      })
      setTree(result.tree)
      setParsedContent(result)
    },
    [values, codeTheme],
    {
      wait: 500,
    },
  )

  const previewRef = useRef<HTMLDivElement>(null)

  // editor
  const onCreateEditorInside = useCallback((view: EditorView) => {
    setView?.(view)
    onCreateEditor?.(view)
  }, [])

  const handleDropFile = useCallback(
    async (file: File) => {
      if (view) {
        editorUpload(file, view)
      }
    },
    [view],
  )

  const computedPosition = useCallback(() => {
    let previewChildNodes = previewRef.current?.childNodes
    const editorElementList: number[] = []
    const previewElementList: number[] = []
    if (view?.state && previewChildNodes) {
      tree?.children.forEach((child, index) => {
        if (
          child.position &&
          previewChildNodes?.[index] &&
          (child as any).tagName !== "style"
        ) {
          if (child.position.start.line > view.state.doc.lines) return
          const line = view.state?.doc.line(child.position.start.line)
          const block = view.lineBlockAt(line.from)
          if (block) {
            editorElementList.push(block.top)
            previewElementList.push(
              (previewChildNodes[index] as HTMLElement).offsetTop,
            )
          }
        }
      })
    }
    return {
      editorElementList,
      previewElementList,
    }
  }, [view, tree])

  const onScroll = useCallback(
    (scrollTop: number, area: string) => {
      if (
        currentScrollArea === area &&
        previewRef.current?.parentElement &&
        view
      ) {
        const position = computedPosition()

        let selfElement
        let selfPosition
        let targetElement
        let targetPosition
        if (area === "preview") {
          selfElement = previewRef.current.parentElement
          selfPosition = position.previewElementList
          targetElement = view.scrollDOM
          targetPosition = position.editorElementList
        } else {
          selfElement = view.scrollDOM
          selfPosition = position.editorElementList
          targetElement = previewRef.current.parentElement
          targetPosition = position.previewElementList
        }

        let scrollElementIndex = 0
        for (let i = 0; i < selfPosition.length; i++) {
          if (scrollTop < selfPosition[i]) {
            scrollElementIndex = i - 1
            break
          }
        }

        // scroll to bottom
        if (scrollTop >= selfElement.scrollHeight - selfElement.clientHeight) {
          targetElement.scrollTop =
            targetElement.scrollHeight - targetElement.clientHeight
          return
        }

        // scroll to position
        if (scrollElementIndex >= 0) {
          let ratio =
            (scrollTop - selfPosition[scrollElementIndex]) /
            (selfPosition[scrollElementIndex + 1] -
              selfPosition[scrollElementIndex])
          targetElement.scrollTop =
            ratio *
              (targetPosition[scrollElementIndex + 1] -
                targetPosition[scrollElementIndex]) +
            targetPosition[scrollElementIndex]
        }
      }
    },
    [view, computedPosition, currentScrollArea],
  )

  const onEditorScroll = useCallback(
    (scrollTop: number) => {
      onScroll(scrollTop, "editor")
    },
    [onScroll],
  )

  const onPreviewScroll = useCallback(
    (scrollTop: number) => {
      onScroll(scrollTop, "preview")
    },
    [onScroll],
  )

  const cmStyle = useMemo(
    () => ({
      ".cm-scroller": {
        padding: "0 1.25rem",
      },
      ".cm-content": {
        paddingBottom: "600px",
      },
    }),
    [],
  )

  const onChangeInside = useCallback(
    (value: string) => {
      setValues(value)
      onChange(value)
    },
    [setValues, onChange],
  )

  return (
    <div className="min-h-0 flex relative items-center size-full">
      {!(isMobileLayout && isRendering) && (
        <CodeMirror
          value={initialContent}
          placeholder={t("Start writing") as string}
          onChange={onChangeInside}
          handleDropFile={handleDropFile}
          onScroll={onEditorScroll}
          cmStyle={cmStyle}
          onCreateEditor={onCreateEditorInside}
          onMouseEnter={() => {
            setCurrentScrollArea("editor")
          }}
          className={cn("h-full flex-1", isRendering ? "border-r" : "")}
          shortcuts={toolbarShortcuts}
        />
      )}
      {!isMobileLayout && (
        <div className="z-10 w-px">
          <div
            aria-label="Toggle preview view"
            className="bg-accent rounded-full cursor-pointer text-white size-6 -translate-x-1/2"
            onClick={() => setIsRendering(!isRendering)}
          >
            {isRendering ? (
              <i className="i-mingcute-right-line text-2xl inline-block size-6" />
            ) : (
              <i className="i-mingcute-left-line text-2xl inline-block size-6" />
            )}
          </div>
        </div>
      )}
      {isRendering && (
        <MarkdownContent
          className="bg-white px-5 overflow-scroll pb-[200px] h-full flex-1"
          parsedContent={parsedContent}
          inputRef={previewRef}
          onScroll={onPreviewScroll}
          onMouseEnter={() => {
            setCurrentScrollArea("preview")
          }}
          codeTheme={codeTheme}
        />
      )}
    </div>
  )
}
