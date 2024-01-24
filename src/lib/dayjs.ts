import dayjs from "dayjs"

import "dayjs/locale/en"
import "dayjs/locale/ja"
import "dayjs/locale/zh"
import "dayjs/locale/zh-tw"

import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"
import relativeTime from "dayjs/plugin/relativeTime"
import tz from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export default dayjs
