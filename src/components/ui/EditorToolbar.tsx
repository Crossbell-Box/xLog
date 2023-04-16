import { EditorView } from "@codemirror/view"
import { FC, memo, useCallback, useState } from "react"
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

type IToolbarItemProps = ICommand<any> & { view?: EditorView }

const ToolbarItemWithPopover: FC<IToolbarItemProps> = ({
  name,
  icon,
  label,
  execute,
  ui,
  view,
}) => {
  const { t } = useTranslation("dashboard")
  let [popoverButtonRef, setPopoverButtonRef] =
    useState<HTMLButtonElement | null>(null)
  let [popoverPanelRef, setPopoverPanelRef] = useState<HTMLDivElement | null>(
    null,
  )
  let { styles: popStyles, attributes: popAttributes } = usePopper(
    popoverButtonRef,
    popoverPanelRef,
  )
  return (
    <Popover key={name}>
      {({ open }: { open: boolean }) => (
        <>
          <Tooltip key={name} label={t(label)} placement="bottom">
            <Popover.Button
              key={name}
              title={name}
              className="w-9 h-9 transition-colors text-lg border border-transparent rounded flex items-center justify-center text-zinc-500 group-hover:text-zinc-600 hover:text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100"
              ref={setPopoverButtonRef}
            >
              <span className={icon}></span>
            </Popover.Button>
          </Tooltip>
          <Popover.Panel
            ref={setPopoverPanelRef}
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
  )
}

export const EditorToolbar: FC<EditorToolbarProps> = memo(
  ({ view, toolbars }) => {
    const { t } = useTranslation("dashboard")
    const renderToolbar = useCallback(
      (mode: ToolbarMode) =>
        // eslint-disable-next-line react/display-name
        ({ name, icon, label, execute, ui }: ICommand) => {
          return ui ? (
            <ToolbarItemWithPopover
              key={name}
              name={name}
              icon={icon}
              label={label}
              execute={execute}
              ui={ui}
              view={view}
            />
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
        },
      [view, t],
    )

    return (
      <div className="flex group">
        <div className="flex-1 flex space-x-1">
          {toolbars?.map(renderToolbar(ToolbarMode.Normal))}
        </div>
      </div>
    )
  },
)

EditorToolbar.displayName = "EditorToolbar"
