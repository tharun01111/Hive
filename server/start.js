import { execSync } from 'child_process'

console.log('Generating Prisma client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('Prisma client generated.')
} catch (err) {
  console.error('Prisma generate failed:', err)
  process.exit(1)
}

console.log('Running database migrations...')
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('Migrations complete.')
} catch (err) {
  console.error('Migration failed:', err)
  process.exit(1)
}