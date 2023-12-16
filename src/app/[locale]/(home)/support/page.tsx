import { DISCORD_LINK } from "~/lib/env"

export default function SupportPage() {
  return (
    <div className="min-h-screen w-full">
      <div className="py-12">
        <div className="max-w-full w-full mx-auto bg-white shadow-lg rounded-lg md:max-w-5xl">
          <div className="md:flex">
            <div className="w-full p-5">
              <div className="md:grid md:grid-cols-3 gap-2">
                <div className="col-span-2 p-5">
                  <h1 className="text-3xl font-medium">Support</h1>
                  <p className="mt-5">
                    You can access our Discord server to get support.
                  </p>
                  <p className="mt-5">
                    <a
                      href={DISCORD_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      Join our Discord server
                    </a>
                  </p>
                  <p className="mt-5">
                    If you want to learn more about xLog, please visit the{" "}
                    <a
                      href={"https://xlog.xlog.app/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      home page
                    </a>{" "}
                    of xLog
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
