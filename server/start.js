import { execSync } from 'child_process'

console.log('Running database migrations...')
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('Migrations complete.')
} catch (err) {
  console.error('Migration failed:', err)
  process.exit(1)
}