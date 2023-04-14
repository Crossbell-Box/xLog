import { EditorView } from "@codemirror/view"
import { cn } from "~/lib/utils"
import { FC, useRef } from "react"
import { ICommand } from "~/editor"
import { Tooltip } from "./Tooltip"
import { useTranslation } from "next-i18next"
import { Popover } from "@headlessui/react"
import { usePopper } from "react-popper"

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
  const popoverButtonRef = useRef(null)
  const popoverPanelRef = useRef(null)
  let { styles: popStyles, attributes: popAttributes } = usePopper(
    popoverButtonRef.current,
    popoverPanelRef.current,
  )

  const renderToolbar =
    (mode: ToolbarMode) =>
    // eslint-disable-next-line react/display-name
    ({ name, icon, label, execute, ui }: ICommand) => {
      return ui ? (
        <Popover key={name}>
          {({ open }: { open: boolean }) => (
            <>
              <Tooltip key={name} label={t(label)} placement="bottom">
                <Popover.Button
                  key={name}
                  title={name}
                  className="w-9 h-9 transition-colors text-lg border border-transparent rounded flex items-center justify-center text-zinc-500 group-hover:text-zinc-600 hover:text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100"
                  ref={popoverButtonRef}
                >
                  <span className={icon}></span>
                </Popover.Button>
              </Tooltip>
              <Popover.Panel
                ref={popoverPanelRef}
                className="z-10"
                style={popStyles.popper}
                {...popAttributes.popper}
              >
                {ui &&
                  view &&
                  ui({
                    transferPayload: (payload) => {
                      view &&
                        execute({
                          view,
                          options: { container: view.dom },
                          payload,
                        })
                    },
                    view,
                  })}
              </Popover.Panel>
            </>
          )}
        </Popover>
      ) : (
        <Tooltip key={name} label={t(label)} placement="bottom">
          <button
            key={name}
            title={name}
            type="button"
            className={
              "w-9 h-9 transition-colors text-lg border border-transparent rounded flex items-center justify-center text-zinc-500 group-hover:text-zinc-600 hover:text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100"
            }
            onClick={() => {
              view &&
                execute({
                  view,
                  options: { container: view.dom },
                })
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
