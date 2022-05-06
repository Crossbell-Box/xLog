import { type AuthUser } from "~/lib/auth.server"
import { prismaRead, prismaWrite } from "~/lib/db.server"
import { createGate } from "~/lib/gate.server"

export const userModel = {
  async updateProfile(
    user: AuthUser | null | undefined,
    payload: {
      name?: string
      username?: string
      avatar?: string
      bio?: string
      email?: string
    }
  ) {
    const gate = createGate({ user, requireAuth: true })
    if (payload.email) {
      const userByEmail = await prismaRead.user.findUnique({
        where: {
          email: payload.email,
        },
      })
      if (userByEmail && userByEmail.id !== gate.user.id) {
        throw new Error("email already in use")
      }
    }

    if (payload.username) {
      const userByUsername = await prismaRead.user.findUnique({
        where: {
          username: payload.username,
        },
      })
      if (userByUsername && userByUsername.id !== gate.user.id) {
        throw new Error("username already in use")
      }
    }

    const updated = await prismaWrite.user.update({
      where: {
        id: gate.user.id,
      },
      data: {
        name: payload.name,
        avatar: payload.avatar,
        username: payload.username,
        email: payload.email,
        emailVerified: payload.email !== gate.user.email ? null : undefined,
      },
    })

    return {
      updated,
    }
  },
}
