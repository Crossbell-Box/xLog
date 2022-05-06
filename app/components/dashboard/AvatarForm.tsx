import { Dialog } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import ReactAvatarEditor from "react-avatar-editor"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { useFetcher } from "@remix-run/react"
import toast from "react-hot-toast"
import createPica from "pica"

const AvatarEditorModal: React.FC<{
  isOpen: boolean
  image?: File | null
  setIsOpen: (open: boolean) => void
  site?: string
}> = ({ isOpen, setIsOpen, image, site }) => {
  const editorRef = useRef<ReactAvatarEditor | null>(null)
  const fetcher = useFetcher()

  const cropAndSave = async () => {
    if (!editorRef.current) return

    const fromCanvas = editorRef.current.getImage()
    const toCanvas = document.createElement("canvas")
    toCanvas.width = 460
    toCanvas.height = 460
    const pica = createPica()
    const result = await pica.resize(fromCanvas, toCanvas)
    const blob = await pica.toBlob(result, "image/jpeg", 0.9)
    const form = new FormData()
    if (site) {
      form.append("site", site)
    }
    form.append("file", blob)
    fetcher.submit(form, {
      action: "/api/save-avatar",
      method: "post",
      encType: "multipart/form-data",
    })
  }

  useEffect(() => {
    if (fetcher.type === "done") {
      setIsOpen(false)
      toast.success("Updated!")
    }
  }, [fetcher.type, setIsOpen])

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-auto">
          <Dialog.Title className="px-5 h-12 flex items-center border-b">
            Adjust the picture
          </Dialog.Title>

          <div className="py-5">
            {image && (
              <ReactAvatarEditor
                ref={editorRef}
                className="mx-auto rounded"
                image={image}
                borderRadius={9999}
              />
            )}
          </div>

          <div className="h-16 border-t flex items-center px-5">
            <Button
              isBlock
              onClick={cropAndSave}
              isLoading={fetcher.state === "submitting"}
            >
              Crop and Save
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export const AvatarForm: React.FC<{
  filename: string | undefined
  name: string
  site?: string
}> = ({ filename, name, site }) => {
  const [isOpen, setIsOpen] = useState(false)
  const inputEl = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | null>(null)

  const onClick = () => {
    inputEl.current?.click()
  }

  const handleChange = (e: any) => {
    const files = e.target.files as File[]
    if (files.length > 0) {
      setImage(files[0])
      setIsOpen(true)
    }
  }

  return (
    <>
      <AvatarEditorModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        image={image}
        site={site}
      />
      <input
        aria-hidden
        className="hidden"
        type="file"
        ref={inputEl}
        onChange={handleChange}
        accept="image/*"
      />
      <Avatar
        images={[getUserContentsUrl(filename)]}
        size={140}
        name={name}
        tabIndex={-1}
        className="cursor-default focus:ring-2 ring-offset-1 ring-zinc-200"
        onClick={onClick}
      />
    </>
  )
}
