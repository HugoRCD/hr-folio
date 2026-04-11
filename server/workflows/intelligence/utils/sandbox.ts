import { Sandbox } from '@vercel/sandbox'

const SANDBOX_NAME = 'hr-folio-intelligence'

async function getOrCreateSandbox() {
  try {
    return await Sandbox.get({ name: SANDBOX_NAME })
  } catch {
    return await Sandbox.create({ name: SANDBOX_NAME })
  }
}

export async function writeToSandbox(folder: string, filename: string, content: string): Promise<void> {
  'use step'

  const sandbox = await getOrCreateSandbox()
  await sandbox.writeFiles([{ path: `${folder}/${filename}.md`, content }])
  await sandbox.stop()
}
