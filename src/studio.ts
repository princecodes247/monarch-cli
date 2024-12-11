import { ensureIsinstalled } from "./lib/package-installer"
import { tasks } from "./lib/spinner"
import { sleep } from "./lib/utils";


export const startStudio = async () => {
  const getRoot = () => process.cwd()
    await ensureIsinstalled("@monarch-orm/ui", getRoot())
    // return (await import('@monarch-orm/ui')).default(ctx)
}