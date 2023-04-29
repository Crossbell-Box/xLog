import { useTranslation } from "next-i18next"
import type { FormEvent } from "react"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"

interface EncryptPasswordPromptProps {
  tryUnlock: (password: string) => void
}
const EncryptPasswordPrompt = ({ tryUnlock }: EncryptPasswordPromptProps) => {
  const { t } = useTranslation("common")

  const submitForm = (ev: FormEvent<HTMLFormElement>) => {
    // Prevent default submit
    ev.preventDefault()

    // Try to unlock with provided password
    tryUnlock((ev as any).target.password.value)
  }

  return (
    <div className="px-6 py-8 sm:py-16 w-full max-w-md m-auto">
      {/*Password Check Form*/}
      <form
        className="max-w-sm flex flex-col gap-6 sm:gap-12 justify-center w-full"
        onSubmit={submitForm}
      >
        {/*Notice Icon*/}
        <div className="text-center">
          <span className="rounded-full text-white bg-[var(--theme-color)] p-2 sm:p-4 inline-flex">
            <i className="icon-[mingcute--lock-fill] inline-block text-xl sm:text-2xl" />
          </span>
        </div>

        {/*Password Input*/}
        <div className="w-full">
          <Input
            placeholder={t("Password") || ""}
            isBlock
            name="password"
            id="password"
            help={t(
              "This content has been encrypted, please enter password here to continue reading.",
            )}
            required
          />
        </div>

        {/*Submit Button*/}
        <div className="text-center">
          <Button variant="primary" type="submit">
            <span className="inline-flex items-center">
              <i className="icon-[mingcute--unlock-fill] inline-block mr-2" />
              <span>{t("Unlock")}</span>
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EncryptPasswordPrompt
