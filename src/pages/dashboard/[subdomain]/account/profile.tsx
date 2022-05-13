import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { trpc } from "~/lib/trpc"

export default function AccountProfilePage() {
  const viewer = trpc.useQuery(["auth.viewer"], {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const updateProfile = trpc.useMutation("user.updateProfile")

  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      email: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateProfile.mutate(values)
  })

  useEffect(() => {
    if (updateProfile.isSuccess) {
      toast.success("Saved!")
      updateProfile.reset()
    }
  }, [updateProfile])

  useEffect(() => {
    if (viewer.data) {
      form.setValue("name", viewer.data.name)
      form.setValue("username", viewer.data.username)
      form.setValue("bio", viewer.data.bio || "")
      form.setValue("email", viewer.data.email || "")
    }
  }, [viewer.data, form])

  return (
    <DashboardLayout>
      <SettingsLayout title="Account" type="account">
        {viewer.data && (
          <div>
            <label className="form-label">Profile Picture</label>
            <AvatarForm filename={viewer.data.avatar} name={viewer.data.name} />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mt-5">
            <Input
              label="Display Name"
              id="name"
              required
              type="text"
              {...form.register("name")}
            />
          </div>
          <div className="mt-5">
            <Input
              label="Username"
              id="username"
              required
              type="text"
              {...form.register("username")}
            />
          </div>
          <div className="mt-5">
            <Input
              label="Email"
              id="email"
              required
              type="email"
              {...form.register("email")}
            />
          </div>
          <div className="mt-10">
            <Button type="submit" isLoading={updateProfile.isLoading}>
              Save
            </Button>
          </div>
        </form>
      </SettingsLayout>
    </DashboardLayout>
  )
}
