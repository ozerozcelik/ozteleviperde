import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const staticSrc = resolve(root, '.next/static')
const publicSrc = resolve(root, 'public')
const staticDest = resolve(root, '.next/standalone/.next/static')
const publicDest = resolve(root, '.next/standalone/public')

mkdirSync(resolve(root, '.next/standalone/.next'), { recursive: true })

if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDest, { recursive: true, force: true })
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true, force: true })
}
