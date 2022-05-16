import { prismaPrimary } from "~/lib/db.server"
import { Gate } from "~/lib/gate.server"
import { checkReservedWords } from "~/lib/reserved-words"

export const userModel = {
  async updateProfile(
    gate: Gate,
    payload: {
      name?: string
      username?: string
      avatar?: string
      bio?: string
      email?: string
    }
  ) {
    const user = gate.getUser(true)

    if (payload.email) {
      const userByEmail = await prismaPrimary.user.findUnique({
        where: {
          email: payload.email,
        },
      })
      if (userByEmail && userByEmail.id !== user.id) {
        throw new Error("email already in use")
      }
    }

    if (payload.username) {
      checkReservedWords(payload.username)

      const userByUsername = await prismaPrimary.user.findUnique({
        where: {
          username: payload.username,
        },
      })
      if (userByUsername && userByUsername.id !== user.id) {
        throw new Error("username already in use")
      }
    }

    const updated = await prismaPrimary.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: payload.name,
        avatar: payload.avatar,
        username: payload.username,
        email: payload.email,
        emailVerified: payload.email !== user.email ? null : undefined,
      },
    })

    return {
      updated,
    }
  },
}
