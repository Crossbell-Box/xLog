import { cookies } from "next/headers"

import { DEFAULT_COLOR_SCHEME } from "./constants"
import { ColorScheme } from "./types"

export const getColorScheme = () =>
  (cookies().get("color_scheme")?.value || DEFAULT_COLOR_SCHEME) as ColorScheme
