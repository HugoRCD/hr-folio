import { Sandbox } from '@vercel/sandbox'

const SANDBOX_NAME = 'hr-folio-intelligence'

export async function writeToSandbox(folder: string, filename: string, content: string): Promise<void> {
  'use step'

  let sandbox: Sandbox | undefined
  try {
    sandbox = await Sandbox.get({ name: SANDBOX_NAME })
  } catch {
    console.warn('[intelligence] Sandbox not available for writeToSandbox — skipping.')
    return
  }

  try {
    await sandbox.writeFiles([{ path: `${folder}/${filename}.md`, content }])
  } finally {
    await sandbox.stop()
  }
}
