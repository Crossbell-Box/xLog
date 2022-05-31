import { EditorView } from "@codemirror/view"
import clsx from "clsx"
import { Dispatch, FC, SetStateAction } from "react"
import { ICommand } from "../command"

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
    ({ name, icon, execute }: ICommand) =>
      (
        <button
          key={name}
          className={clsx(
            "px-1 py-1 mr-1 fill-gray-700 transition-colors hover:fill-blue-500",
            {
              "fill-blue-500": mode === ToolbarMode.Preview && previewVisible,
            },
          )}
          onClick={() => {
            view && execute(view, { setPreviewVisible, container: view.dom })
          }}
        >
          {icon}
        </button>
      )

  return (
    <div className="flex px-1 py-1 bg-gray-100 border rounded border-gray-200">
      <div className="flex-1">
        {toolbars?.map(renderToolbar(ToolbarMode.Normal))}
      </div>
      <div>{modeToolbars?.map(renderToolbar(ToolbarMode.Preview))}</div>
    </div>
  )
}
