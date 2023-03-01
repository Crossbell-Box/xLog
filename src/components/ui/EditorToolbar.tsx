import { EditorView } from "@codemirror/view"
import { cn } from "~/lib/utils"
import { Dispatch, FC, SetStateAction } from "react"
import { ICommand } from "~/editor"
import { Tooltip } from "./Tooltip"
import { useTranslation } from "next-i18next"

export interface EditorToolbarProps {
  view?: EditorView
  toolbars: ICommand[]
}

enum ToolbarMode {
  Normal,
  Preview,
}

export const EditorToolbar: FC<EditorToolbarProps> = ({ view, toolbars }) => {
  const { t } = useTranslation("dashboard")
  const renderToolbar =
    (mode: ToolbarMode) =>
    // eslint-disable-next-line react/display-name
    ({ name, icon, label, execute }: ICommand) => {
      return (
        <Tooltip key={name} label={t(label)} placement="bottom">
          <button
            key={name}
            type="button"
            className={
              "w-9 h-9 transition-colors text-lg border border-transparent rounded flex items-center justify-center text-zinc-500 group-hover:text-zinc-600 hover:text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100"
            }
            onClick={() => {
              view && execute(view, { container: view.dom })
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
    </div>
  )
}
