/**
 * Connectivity check for whatever DATABASE_URL points at.
 *
 * Run it after whitelisting your IP on the database server:
 *
 *   node -r dotenv/config check-db-connection.js
 *
 * It reports the host it tried, whether the connection succeeded, and — when
 * MySQL refuses the host (error 1130) — the public IP that needs whitelisting.
 * The password is never printed.
 */

const { PrismaClient } = require('@prisma/client')

function describeTarget(url) {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parsed.port || '3306',
      user: decodeURIComponent(parsed.username || ''),
      database: parsed.pathname.replace(/^\//, ''),
    }
  } catch {
    return null
  }
}

async function publicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(8000),
    })
    return (await res.json()).ip
  } catch {
    return null
  }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set. Did you run with -r dotenv/config?')
    process.exit(1)
  }

  const target = describeTarget(url)
  if (target) {
    console.log(`host     : ${target.host}:${target.port}`)
    console.log(`user     : ${target.user}`)
    console.log(`database : ${target.database}`)
  }
  console.log('')

  const prisma = new PrismaClient()
  const started = Date.now()

  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT DATABASE() AS db, NOW() AS server_time, @@version AS version'
    )
    const row = rows[0] || {}
    console.log(`CONNECTED in ${Date.now() - started}ms`)
    console.log(`  database    : ${row.db}`)
    console.log(`  server time : ${row.server_time}`)
    console.log(`  mysql       : ${row.version}`)

    const [content] = await prisma.$queryRawUnsafe(
      'SELECT COUNT(*) AS n, MAX(updated_at) AS newest FROM specialization_level_contents'
    )
    console.log(`  level rows  : ${content.n}`)
    console.log(`  newest edit : ${content.newest}`)
  } catch (error) {
    const message = String(error?.message || error)
    console.log('FAILED')
    console.log(message.split('\n').filter(Boolean).slice(-1)[0])

    if (message.includes('1130') || message.includes('not allowed to connect')) {
      const ip = await publicIp()
      console.log('')
      console.log('The server was reached but refused this machine.')
      console.log(`Whitelist this IP on the database server: ${ip || '(lookup failed)'}`)
    }
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
