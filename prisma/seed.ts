import "dotenv/config"
import p from "@prisma/client"

async function main() {
  const prisma = new p.PrismaClient()

  const writer = await prisma.user.create({
    data: {
      email: "writer@test.com",
      username: "writer",
      name: "Writer",
    },
  })

  const site = await prisma.site.create({
    data: {
      name: `Writer's blog`,
      subdomain: "writer",
      memberships: {
        create: {
          role: "OWNER",
          user: {
            connect: {
              id: writer.id,
            },
          },
        },
      },
    },
  })

  const subscriber = await prisma.user.create({
    data: {
      email: "subscriber@test.com",
      username: "subscriber",
      name: "Subscriber",
      memberships: {
        create: {
          role: "SUBSCRIBER",
          site: {
            connect: {
              id: site.id,
            },
          },
        },
      },
    },
  })

  console.log("success!")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
