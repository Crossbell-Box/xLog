/* eslint-disable react/prop-types */

/* eslint-disable react-hooks/exhaustive-deps */
import type { FC, PropsWithChildren, ReactNode, SetStateAction } from "react"
import {
  createContext,
  createElement,
  Dispatch,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Modal as ModalImpl,
  ModalProps as ModalImplProps,
} from "~/components/ui/Modal"
import { useIsClient } from "~/hooks/useClient"

const modalIdToPropsMap = {} as Record<string, ModalProps>

export type ModalContentProps<T = {}> = { dismiss: () => void } & T
interface ModalProps {
  title: ReactNode
  content: FC<ModalContentProps>

  modalProps?: Partial<Omit<ModalImplProps, "open" | "setOpen" | "afterLeave">>
}

interface ModalInstance {
  modalClose: () => void
}
interface ModalStackContextValue extends ModalProps {
  id: string
  ins?: ModalInstance
}
const ModalStackContext = createContext<ModalStackContextValue[]>([])
const SetModalStackContext = createContext<
  Dispatch<SetStateAction<ModalStackContextValue[]>>
>(() => void 0)

export const useModalStack = () => {
  const id = useId()
  const currentCount = useRef(0)
  const setStack = useContext(SetModalStackContext)
  return useMemo(
    () => ({
      present(props: ModalProps & { id?: string }) {
        const modalId = `${id}-${currentCount.current++}`
        setStack((p) => {
          const modalProps = {
            ...props,
            id: props.id ?? modalId,
          }
          modalIdToPropsMap[modalProps.id] = modalProps
          return p.concat(modalProps)
        })

        return () => {
          setStack((p) => {
            return p.filter((item) => item.id !== modalId)
          })
        }
      },

      dismiss(id: string) {
        setStack((p) => {
          const m = p.find((item) => item.id === id)
          if (m?.ins) {
            m.ins.modalClose()
            return p
          }

          return p.filter((item) => item.id !== id)
        })
      },
    }),
    [id, setStack],
  )
}

export const ModalStackProvider: FC<PropsWithChildren> = ({ children }) => {
  const [modal, setModal] = useState(
    [] as React.ContextType<typeof ModalStackContext>,
  )
  return (
    <SetModalStackContext.Provider value={setModal}>
      {children}
      <ModalStackContext.Provider value={modal}>
        <ModalStack />
      </ModalStackContext.Provider>
    </SetModalStackContext.Provider>
  )
}

const ModalStack = () => {
  const stack = useContext(ModalStackContext)

  const isClient = useIsClient()
  if (!isClient) return null

  return (
    <>
      {stack.map((item, index) => {
        return <Modal key={item.id} item={item} index={index} />
      })}
    </>
  )
}
const Modal = memo<{
  item: ModalProps & { id: string }
  index: number
}>(function Modal({ item, index }) {
  const setStack = useContext(SetModalStackContext)
  const close = useCallback(() => {
    setStack((p) => {
      return p.filter((modal) => modal.id !== item.id)
    })
  }, [item.id])

  const instanceRef = useRef<ModalInstance>({
    modalClose: () => {
      setOpen(false)
    },
  })

  const { content, title, modalProps } = item

  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(true)

    // set instanceRef

    setStack((p) => {
      const newStack = [...p]
      newStack[index].ins = instanceRef.current
      return newStack
    })
  }, [])
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])
  const afterLeave = useCallback(() => {
    close()
  }, [])
  return (
    <ModalImpl
      open={open}
      afterLeave={afterLeave}
      setOpen={handleClose}
      title={title}
      {...modalProps}
    >
      {createElement(content, {
        dismiss: handleClose,
      })}
    </ModalImpl>
  )
})
