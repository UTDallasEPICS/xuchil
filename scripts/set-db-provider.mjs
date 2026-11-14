// Selects the Prisma datasource provider based on DATABASE_URL.
//   file:...      -> sqlite      (local development)
//   postgres...   -> postgresql  (Heroku / production)
// Runs before `prisma generate`, `next build` and `prisma db push`.
import { readFileSync, writeFileSync } from 'node:fs'

const url = process.env.DATABASE_URL ?? ''
const provider = url.startsWith('postgres') ? 'postgresql' : 'sqlite'
const path = 'prisma/schema.prisma'

const schema = readFileSync(path, 'utf8')
const updated = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`,
)

if (schema !== updated) {
  writeFileSync(path, updated)
  console.log(`Prisma provider -> ${provider}`)
} else {
  console.log(`Prisma provider already ${provider}`)
}
