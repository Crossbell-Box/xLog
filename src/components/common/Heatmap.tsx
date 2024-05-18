"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import { Tooltip } from "~/components/ui/Tooltip"
import dayjs from "~/lib/dayjs"
import { getSiteLink } from "~/lib/helpers"
import { useCalendar } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function CalHeatmap({ characterId }: { characterId?: number }) {
  const calendar = useCalendar(characterId)
  const t = useTranslations()

  const params = useParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)

  return (
    <div className="overflow-x-auto">
      <div className="flex sm:gap-1 gap-[2px]">
        {calendar.data?.calendar.map((week, index: number) => (
          <div className="flex sm:gap-1 gap-[2px] flex-col" key={index}>
            {week.map((day) => (
              <Tooltip
                key={day.day.valueOf()}
                label={
                  <>
                    <p className="mb-2">
                      {day.count} {t("on-chain posting on")}{" "}
                      {dayjs(day.day).format("MMM DD, YYYY")}
                    </p>
                    <ul className="space-y-1">
                      {day.meta.map((m) => (
                        <li key={`${day.day}${index}`} className="text-xs">
                          {m.slug ? (
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={
                                getSiteLink({
                                  subdomain,
                                  domain:
                                    site.data?.metadata?.content?.custom_domain,
                                }) +
                                "/" +
                                m.slug
                              }
                            >
                              {m.title}
                            </a>
                          ) : (
                            m.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                }
                placement="top"
                className="z-10"
              >
                <div
                  className={
                    "sm:w-[12px] sm:h-[12px] w-1 h-1 cursor-pointer sm:rounded-sm rounded-[1px] " +
                    (day.count === 0
                      ? "bg-gray-100"
                      : day.count > 0 && day.count < 2
                        ? "bg-green-300"
                        : day.count >= 2 && day.count < 5
                          ? "bg-green-400"
                          : day.count >= 5 && day.count < 10
                            ? "bg-green-500"
                            : "bg-green-600")
                  }
                ></div>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
