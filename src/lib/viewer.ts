import { AuthUser } from "./auth.server"
import { Viewer } from "./types"

export const getViewer = (user: AuthUser | null | undefined): Viewer | null => {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    username: user.username,
  }
}
