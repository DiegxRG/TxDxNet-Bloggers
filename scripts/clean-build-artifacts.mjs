import { rm } from 'node:fs/promises'
import path from 'node:path'

const buildDirectory = path.resolve('.next')

await rm(buildDirectory, { force: true, recursive: true })
console.log(`[clean:build] Eliminado ${buildDirectory}`)
