import { spawn, spawnSync } from 'node:child_process'
import { hostname, networkInterfaces } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config as loadEnv } from 'dotenv'

const port = process.env.PORT || '3000'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
loadEnv({ path: join(root, '.env.local') })
loadEnv({ path: join(root, '.env') })

const mobile = process.argv.includes('--mobile')
const nextHost = mobile ? '0.0.0.0' : 'localhost'
const localUrl = `http://localhost:${port}`
const webhookTarget = `${localUrl}/api/webhooks/stripe`

const children = []

function hasStripeCli() {
  const r = spawnSync('stripe', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' })
  return r.status === 0
}

function stripeApiKeyFromEnv() {
  if (process.env.PAYMENT_ENV === 'test') {
    return process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY
  }
  return process.env.STRIPE_SECRET_KEY
}

function lanIpv4() {
  for (const ifaces of Object.values(networkInterfaces())) {
    if (!ifaces) continue
    for (const { family, address, internal } of ifaces) {
      if (family === 'IPv4' && !internal) return address
    }
  }
  return null
}

function bonjourHost() {
  const short = hostname().split('.')[0]
  return short ? `${short}.local` : null
}

function printDevBanner() {
  console.log('')
  console.log('  Mac browser:     ' + localUrl)
  if (mobile) {
    const ip = lanIpv4()
    const bonjour = bonjourHost()
    console.log('')
    console.log('  Physical phone — localhost is the phone itself, not this Mac.')
    console.log('  Use one of these instead:')
    if (bonjour) {
      console.log('    • http://' + bonjour + ':' + port + '  (often works on same Wi‑Fi)')
    }
    if (ip) {
      console.log('    • http://' + ip + ':' + port)
    } else {
      console.log('    • http://<your-mac-lan-ip>:' + port)
    }
    console.log('    • Android + USB: adb reverse tcp:' + port + ' tcp:' + port)
    console.log('      then open ' + localUrl + ' on the device')
    console.log('    • iOS Simulator on this Mac: ' + localUrl)
    console.log('')
    console.log('  Turby: ' + (ip ? `http://${ip}:${port}` : localUrl) + '/turby')
    console.log('  Midsummer: ' + (ip ? `http://${ip}:${port}` : localUrl) + '/midsummer')
  }
  console.log('')
  console.log('  Stripe webhooks → ' + webhookTarget)
  if (process.env.PAYMENT_ENV !== 'test') {
    console.log('  Tip: set PAYMENT_ENV=test in .env.local for test-mode Stripe + sheets.')
  }
  console.log('')
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  setTimeout(() => process.exit(code), 100)
}

function spawnChild(label, command, args, { fatal = true } = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })
  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`\n  ${label} stopped (${signal}).`)
    } else if (code && code !== 0) {
      console.error(`\n  ${label} exited with code ${code}.`)
    }
    if (fatal) {
      shutdown(code ?? 0)
    }
  })
  children.push(child)
  return child
}

printDevBanner()

if (hasStripeCli()) {
  const stripeArgs = ['listen', '--forward-to', webhookTarget]
  const stripeKey = stripeApiKeyFromEnv()
  if (stripeKey) {
    stripeArgs.push('--api-key', stripeKey)
  } else {
    console.warn('  No STRIPE_SECRET_KEY in .env.local — Stripe CLI will use `stripe login` credentials.')
    console.warn('  If auth fails, add TEST_STRIPE_SECRET_KEY or run `stripe login` again.')
    console.log('')
  }
  spawnChild('Stripe CLI', 'stripe', stripeArgs, { fatal: false })
} else {
  console.warn('  Stripe CLI not found — skipping `stripe listen`.')
  console.warn('  Install: https://stripe.com/docs/stripe-cli')
  console.warn('  Or run manually: stripe listen --forward-to ' + webhookTarget)
  console.log('')
}

spawnChild('Next.js', 'next', ['dev', '-H', nextHost, '-p', port])

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
