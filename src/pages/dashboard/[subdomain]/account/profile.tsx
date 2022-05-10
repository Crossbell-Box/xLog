import { useFormik } from "formik"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { trpc } from "~/lib/trpc"

export default function AccountProfilePage() {
  const viewer = trpc.useQuery(["auth.viewer"])
  const updateProfile = trpc.useMutation("user.updateProfile")

  const form = useFormik({
    initialValues: {
      name: "",
      username: "",
      bio: "",
      email: "",
    },
    onSubmit(values) {
      updateProfile.mutate(values)
    },
  })

  useEffect(() => {
    if (updateProfile.isSuccess) {
      updateProfile.reset()
      toast.success("Saved!")
    }
  }, [updateProfile])

  useEffect(() => {
    if (viewer.data) {
      form.setValues({
        name: viewer.data.name,
        username: viewer.data.username,
        bio: viewer.data.bio || "",
        email: viewer.data.email,
      })
    }
  }, [viewer.data, form])

  return (
    <DashboardLayout>
      <SettingsLayout title="Account" type="account">
        {viewer.data && (
          <div>
            <label className="label">Profile Picture</label>
            <AvatarForm filename={viewer.data.avatar} name={viewer.data.name} />
          </div>
        )}
        <form onSubmit={form.handleSubmit}>
          <div className="mt-5">
            <Input
              label="Display Name"
              id="name"
              name="name"
              required
              type="text"
              value={form.values.name}
              onChange={form.handleChange}
            />
          </div>
          <div className="mt-5">
            <Input
              label="Username"
              id="username"
              name="username"
              required
              type="text"
              value={form.values.username}
              onChange={form.handleChange}
            />
          </div>
          <div className="mt-5">
            <Input
              label="Email"
              id="email"
              name="email"
              required
              type="email"
              value={form.values.email}
              onChange={form.handleChange}
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
