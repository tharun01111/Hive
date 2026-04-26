import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: 'postgresql://hive:hive_password@localhost:5432/hive_db',
  },
  migrate: {
    adapter() {
      return new PrismaPg({
        connectionString: 'postgresql://hive:hive_password@localhost:5432/hive_db',
      })
    },
  },
})