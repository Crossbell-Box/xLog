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
  const {
    mutate: updateProfile,
    status: updateProfileStatus,
    error: updateProfileError,
  } = trpc.useMutation("user.updateProfile")

  const { setValue, handleSubmit, register } = useForm({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      email: "",
    },
  })

  const onSubmit = handleSubmit((values) => {
    updateProfile(values)
  })

  useEffect(() => {
    if (updateProfileStatus === "success") {
      toast.success("Saved!")
    } else if (updateProfileStatus === "error" && updateProfileError) {
      toast.error(updateProfileError.message)
    }
  }, [updateProfileStatus, updateProfileError])

  useEffect(() => {
    if (viewer.data) {
      setValue("name", viewer.data.name)
      setValue("username", viewer.data.username)
      setValue("bio", viewer.data.bio || "")
      setValue("email", viewer.data.email || "")
    }
  }, [viewer.data, setValue])

  return (
    <DashboardLayout title="Account">
      <SettingsLayout title="Account" type="account">
        {viewer.data && (
          <div>
            <label className="form-label">Profile Picture</label>
            <AvatarForm filename={viewer.data.avatar} name={viewer.data.name} />
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="mt-5">
            <Input
              label="Display Name"
              id="name"
              required
              type="text"
              {...register("name")}
            />
          </div>
          <div className="mt-5">
            <Input
              label="Username"
              id="username"
              required
              type="text"
              {...register("username")}
            />
          </div>
          <div className="mt-5">
            <Input
              label="Email"
              id="email"
              required
              type="email"
              {...register("email")}
            />
          </div>
          <div className="mt-10">
            <Button type="submit" isLoading={updateProfileStatus === "loading"}>
              Save
            </Button>
          </div>
        </form>
      </SettingsLayout>
    </DashboardLayout>
  )
}
