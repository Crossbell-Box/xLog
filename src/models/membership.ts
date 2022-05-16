import { string } from "zod"
import { prismaRead, MembershipRole, prismaPrimary } from "~/lib/db.server"

export const getMembership = async (data: {
  siteId: string
  userId: string
  role: MembershipRole
}) => {
  const first = await prismaRead.membership.findFirst({
    where: {
      role: data.role,
      userId: data.userId,
      siteId: data.siteId,
    },
  })

  return first
}

export const getMemberships = async ({
  userId,
  // Only return memberships that the user is an owner/admin of
  canManage,
}: {
  userId: string
  canManage?: boolean
}) => {
  const memberships = await prismaRead.membership.findMany({
    where: {
      userId,
      role: canManage
        ? {
            in: [MembershipRole.ADMIN, MembershipRole.OWNER],
          }
        : undefined,
    },
    include: {
      site: true,
    },
  })

  return memberships
}

export const updateMembership = async (
  membershipId: string,
  input: { lastSwitchedTo?: Date }
) => {
  await prismaPrimary.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      lastSwitchedTo: input.lastSwitchedTo,
    },
  })
}
