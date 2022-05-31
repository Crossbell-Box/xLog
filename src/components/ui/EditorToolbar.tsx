import { EditorView } from "@codemirror/view"
import clsx from "clsx"
import { Dispatch, FC, SetStateAction } from "react"
import { ICommand } from "~/editor"
import { Tooltip } from "./Tooltip"

export interface EditorToolbarProps {
  view: EditorView | null
  toolbars: ICommand[]
  modeToolbars: ICommand[]
  previewVisible: boolean
  setPreviewVisible: Dispatch<SetStateAction<boolean>>
}

enum ToolbarMode {
  Normal,
  Preview,
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  view,
  toolbars,
  modeToolbars,
  previewVisible,
  setPreviewVisible,
}) => {
  const renderToolbar =
    (mode: ToolbarMode) =>
    // eslint-disable-next-line react/display-name
    ({ name, icon, label, execute }: ICommand) => {
      const isPreviewModeCommand = mode === ToolbarMode.Preview
      const active = isPreviewModeCommand && previewVisible
      const disabled = !isPreviewModeCommand && previewVisible
      return (
        <Tooltip label={label} placement="bottom">
          <button
            key={name}
            type="button"
            disabled={disabled}
            className={clsx(
              "w-7 h-7 transition-colors text-lg border border-transparent rounded flex items-center justify-center",
              active
                ? `bg-indigo-400 text-white border-indigo-400`
                : disabled
                ? `text-zinc-400 cursor-not-allowed`
                : `text-zinc-400 group-hover:text-zinc-600 hover:text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100`,
            )}
            onClick={() => {
              view && execute(view, { setPreviewVisible, container: view.dom })
            }}
          >
            <span className={icon}></span>
          </button>
        </Tooltip>
      )
    }

  return (
    <div className="flex group">
      <div className="flex-1 flex space-x-1">
        {toolbars?.map(renderToolbar(ToolbarMode.Normal))}
      </div>
      <div className="ml-1">
        {modeToolbars?.map(renderToolbar(ToolbarMode.Preview))}
      </div>
    </div>
  )
}
