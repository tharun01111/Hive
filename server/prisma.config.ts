import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

const isInsideDocker = process.env.RUNNING_IN_DOCKER === 'true'

const connectionString = isInsideDocker
  ? 'postgresql://hive:hive_password@postgres:5432/hive_db'
  : 'postgresql://hive:hive_password@localhost:5432/hive_db'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: connectionString,
  },
  migrate: {
    adapter() {
      return new PrismaPg({ connectionString })
    },
  },
})