import { PrismaConfig } from "@prisma/config"

const config: PrismaConfig = {
  schema: {
    folders: ["./prisma"],
  },
  adapter: {
    provider: "mysql",
    url: process.env.DATABASE_URL,
  },
}

export default config
