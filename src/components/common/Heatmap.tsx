"use client"

import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import { useTranslations } from "next-intl"

import { Tooltip } from "~/components/ui/Tooltip"
import { useCalendar } from "~/queries/page"

dayjs.extend(advancedFormat)

export default function CalHeatmap({ characterId }: { characterId?: number }) {
  const calendar = useCalendar(characterId)
  const t = useTranslations()

  return (
    <div className="overflow-x-auto">
      <div className="flex sm:gap-1 gap-[2px]">
        {calendar.data?.calendar.map((week: any, index: number) => (
          <div className="flex sm:gap-1 gap-[2px] flex-col" key={index}>
            {week.map((day: any) => (
              <Tooltip
                key={day.day}
                label={
                  <>
                    <p>
                      {day.count} {t("on-chain posting on")}{" "}
                      {dayjs(day.day).format("MMM DD, YYYY")}
                    </p>
                    {(() =>
                      day.titles.map((title: string) => (
                        <p key={`${day.day}${index}`} className="text-xs">
                          {title}
                        </p>
                      )))()}
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
