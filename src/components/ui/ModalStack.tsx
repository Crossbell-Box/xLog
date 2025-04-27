/* eslint-disable react/prop-types */
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

// Track the props of modals by their ID.
const modalIdToPropsMap = {} as Record<string, ModalProps>

// Define types for ModalProps
export type ModalContentProps<T = {}> = { dismiss: () => void } & T

interface ModalProps {
  title: ReactNode
  content: FC<ModalContentProps> // Content component for the modal
  modalProps?: Partial<Omit<ModalImplProps, "open" | "setOpen" | "afterLeave">> // Custom modal props
}

interface ModalInstance {
  modalClose: () => void // Method to close the modal
}

// Contexts for modal stack management
interface ModalStackContextValue extends ModalProps {
  id: string
  ins?: ModalInstance
}

const ModalStackContext = createContext<ModalStackContextValue[]>([]) // Context for modal stack
const SetModalStackContext = createContext<
  Dispatch<SetStateAction<ModalStackContextValue[]>>
>(() => void 0) // Context to modify modal stack

// Custom hook to manage modal stack
export const useModalStack = () => {
  const id = useId() // Generate unique id for modals
  const currentCount = useRef(0) // Counter to increment modal id
  const setStack = useContext(SetModalStackContext) // Access context for updating modal stack

  return useMemo(
    () => ({
      // Present a new modal in the stack
      present(props: ModalProps & { id?: string }) {
        const modalId = `${id}-${currentCount.current++}` // Create a unique id for each modal
        setStack((p) => {
          const modalProps = {
            ...props,
            id: props.id ?? modalId,
          }
          modalIdToPropsMap[modalProps.id] = modalProps
          return p.concat(modalProps)
        })

        return () => {
          setStack((p) => p.filter((item) => item.id !== modalId)) // Dismiss modal from stack
        }
      },

      // Dismiss a modal from the stack by its ID
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

// Modal Stack Provider that provides modal stack context
export const ModalStackProvider: FC<PropsWithChildren> = ({ children }) => {
  const [modal, setModal] = useState(
    [] as React.ContextType<typeof ModalStackContext>,
  ) // Store modal stack
  return (
    <SetModalStackContext.Provider value={setModal}>
      {children}
      <ModalStackContext.Provider value={modal}>
        <ModalStack /> {/* Render modal stack */}
      </ModalStackContext.Provider>
    </SetModalStackContext.Provider>
  )
}

// Render all modals in the stack
const ModalStack = () => {
  const stack = useContext(ModalStackContext)

  const isClient = useIsClient() // Ensure modals are rendered only on the client-side
  if (!isClient) return null

  return (
    <>
      {stack.map((item, index) => (
        <Modal key={item.id} item={item} index={index} />
      ))}
    </>
  )
}

// Modal component to render individual modal
const Modal = memo<{
  item: ModalProps & { id: string }
  index: number
}>(function Modal({ item, index }) {
  const setStack = useContext(SetModalStackContext)
  const close = useCallback(() => {
    setStack((p) => p.filter((modal) => modal.id !== item.id)) // Close and remove modal from stack
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

export default Modal
