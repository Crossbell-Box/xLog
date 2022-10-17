import { Dialog } from "@headlessui/react"
import { useRef, useState, useEffect } from "react"
import ReactAvatarEditor from "react-avatar-editor"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import toast from "react-hot-toast"
import createPica from "pica"
import { UploadFile, useUploadFile } from "~/hooks/useUploadFile"
import { useUpdateSite } from "~/queries/site"

const AvatarEditorModal: React.FC<{
  isOpen: boolean
  image?: File | null
  setIsOpen: (open: boolean) => void
  site: string
  uploadFile: UploadFile
}> = ({ isOpen, setIsOpen, image, site, uploadFile }) => {
  const editorRef = useRef<ReactAvatarEditor | null>(null)
  const updateSite = useUpdateSite()
  const [uploadFileProgress, setUploadFileProgress] = useState(false)

  const useCropAndSave = async () => {
    let key
    setUploadFileProgress(true)
    // Get cropped image
    if (editorRef.current) {
      const fromCanvas = editorRef.current?.getImage()
      let blob: Blob | null
      try {
        const toCanvas = document.createElement("canvas")
        toCanvas.width = 460
        toCanvas.height = 460
        const pica = createPica()
        const result = await pica.resize(fromCanvas, toCanvas)
        blob = await pica.toBlob(result, "image/jpeg", 0.9)
      } catch (error) {
        blob = await new Promise((resolve) => fromCanvas.toBlob(resolve))
      }

      // Upload image to R2
      if (blob) {
        key = (await uploadFile(blob)).key
      }
    }

    // Save the image to profile / site
    updateSite.mutate({ site, icon: key })
    setUploadFileProgress(false)
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      setIsOpen(false)
      toast.success("Updated!")
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess, updateSite.isError, setIsOpen])

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
              onClick={useCropAndSave}
              isLoading={uploadFileProgress || updateSite.isLoading}
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
  filename: string | undefined | null
  name: string
  site: string
}> = ({ filename, name, site }) => {
  const [isOpen, setIsOpen] = useState(false)
  const inputEl = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | null>(null)
  const uploadFile = useUploadFile()

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
        uploadFile={uploadFile}
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
