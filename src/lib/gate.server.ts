import { MembershipRole, type Site, type Page } from "~/lib/db.server"
import type { AuthUser } from "./auth.server"
import { PageVisibilityEnum } from "./types"

type Action =
  | {
      type: "can-delete-page"
      /** The site id this page belongs to */
      siteId: string
    }
  | {
      type: "can-list-page"
      visibility: PageVisibilityEnum
      siteId: string
    }
  | {
      type: "can-create-page"
      siteId: string
    }
  | { type: "can-update-page"; siteId: string }
  | {
      type: "can-read-page"
      page: Page
    }
  | {
      type: "can-update-site"
      site: Site
    }
  | {
      type: "can-notify-site-subscribers"
      site: Site
    }
  | {
      type: "can-update-membership"
      membership: { id: string }
    }
export const createGate = <TRequiredAuth extends boolean | undefined>({
  user,
}: {
  user: AuthUser | null | undefined
}) => {
  const isSiteMember = (siteId: string, roles: MembershipRole[]) => {
    if (!user) return false
    return user.memberships.some(
      (m) => m.siteId === siteId && roles.includes(m.role),
    )
  }

  const userHasMembership = (membershipId: string) => {
    if (!user) return false
    return user.memberships.some((m) => m.id === membershipId)
  }

  return {
    getUser<TRequiredAuth extends boolean | undefined>(
      requireAuth?: TRequiredAuth,
    ) {
      if (requireAuth && !user) {
        throw new Error("unauthorized")
      }
      return user as TRequiredAuth extends true
        ? AuthUser
        : AuthUser | null | undefined
    },

    hasRoles(siteId: string, roles: MembershipRole[]) {
      return isSiteMember(siteId, roles)
    },

    isOwnerOrAdmin(siteId: string) {
      return this.hasRoles(siteId, [MembershipRole.OWNER, MembershipRole.ADMIN])
    },

    allows(action: Action): boolean {
      if (action.type === "can-delete-page") {
        return isSiteMember(action.siteId, [
          MembershipRole.ADMIN,
          MembershipRole.OWNER,
        ])
      }

      if (action.type === "can-list-page") {
        if (action.visibility === PageVisibilityEnum.Published) {
          return true
        }
        return isSiteMember(action.siteId, [
          MembershipRole.ADMIN,
          MembershipRole.OWNER,
        ])
      }

      if (action.type === "can-create-page") {
        return isSiteMember(action.siteId, [
          MembershipRole.ADMIN,
          MembershipRole.OWNER,
        ])
      }

      if (action.type === "can-update-page") {
        return isSiteMember(action.siteId, [
          MembershipRole.ADMIN,
          MembershipRole.OWNER,
        ])
      }

      if (action.type === "can-read-page") {
        const isPublished =
          action.page.published &&
          action.page.publishedAt &&
          action.page.publishedAt <= new Date()

        return isPublished
          ? !action.page.deletedAt
          : !action.page.deletedAt &&
              isSiteMember(action.page.siteId, [
                MembershipRole.ADMIN,
                MembershipRole.OWNER,
              ])
      }

      if (action.type === "can-update-site") {
        return isSiteMember(action.site.id, [
          MembershipRole.ADMIN,
          MembershipRole.OWNER,
        ])
      }

      if (action.type === "can-notify-site-subscribers") {
        return isSiteMember(action.site.id, [
          MembershipRole.ADMIN,
          MembershipRole.OWNER,
        ])
      }

      if (action.type === "can-update-membership") {
        return userHasMembership(action.membership.id)
      }

      return false
    },
    permissionError(message = "not allowed") {
      return new Error(message)
    },
  }
}

export type Gate = ReturnType<typeof createGate>
