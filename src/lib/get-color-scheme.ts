import { cookies } from "next/headers"

import { ColorScheme } from "./types"

export const getColorScheme = async () =>
  (await cookies()).get("color_scheme")?.value as ColorScheme
