import { PageEmailStatus } from "@prisma/client"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useStore } from "~/lib/store"
import { trpc } from "~/lib/trpc"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Modal } from "../ui/Modal"

export const EmailPostModal: React.FC<{
  pageId: string
}> = ({ pageId }) => {
  const [open, setOpen] = useStore((store) => [
    store.emailPostModalOpened,
    store.setEmailPostModalOpened,
  ])

  const { handleSubmit, register } = useForm({
    defaultValues: {
      subject: "",
    },
  })
  const scheduleEmailForPost = trpc.useMutation("site.scheduleEmailForPost")

  const onSubmit = handleSubmit(async (values) => {
    await scheduleEmailForPost.mutateAsync({
      pageId,
      emailSubject: values.subject,
    })
    toast.success("Scheduled!")
    setOpen(false)
  })

  return (
    <Modal title="Email Post" open={open} setOpen={setOpen}>
      {
        <form onSubmit={onSubmit}>
          <div className="p-5">
            <Input
              label="Email subject"
              id="subject"
              help="Defaults to post title"
              isBlock
              {...register("subject")}
            />
          </div>
          <div className="p-5 border-t">
            <Button type="submit" isLoading={scheduleEmailForPost.isLoading}>
              <span className="i-mdi:email-send text-xl mr-1"></span>
              <span>Send Email</span>
            </Button>
          </div>
        </form>
      }
    </Modal>
  )
}
