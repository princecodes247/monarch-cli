import { createRequire } from 'node:module';
import { isPackageExists } from 'local-pkg'
import c from 'tinyrainbow'
import { tasks } from './spinner';
import { sleep } from './utils';

export const installPackage = async (dependency: string, version?: string) => {
    
    const shouldInstall = await (await import('@inquirer/prompts')).confirm({ message: `Do you want to install ${c.green(dependency)}?` });
    if(!shouldInstall) return false;
    const packageName = version ? `${dependency}@${version}` : dependency;

    // await (
    //     await import('@antfu/install-pkg')
    //   ).installPackage(packageName, { silent: true })

      const queue = [
        {
          pending: `Install ${packageName}`,
          start: `Installing ${packageName}`,
          end: `${packageName} installed`,
          // async callback will be called and awaited sequentially
          while: () => sleep(5000),
        },
        // etc
      ];
    
      const labels = {
        start: "Starting studio...",
        end: "Studio started!",
      };
        sleep(10000),

    tasks(labels, queue)
}

export const ensureIsinstalled = async (dependency: string, root: string, version?: string) => {
    if (process.versions.pnp) {
        const targetRequire = createRequire(__dirname)
        try {
          targetRequire.resolve(dependency, { paths: [root, __dirname] })
          return true
        }
        catch {}
      }
  
    if (
        /* @__PURE__ */ isPackageExists(dependency, { paths: [root, __dirname] })
      ) return true

    const promptInstall = process.stdout.isTTY
    if (!promptInstall) return false
    process.stderr.write(
        c.red(
          `${c.inverse(
            c.red(' MISSING DEPENDENCY '),
          )} Cannot find dependency '${dependency}'\n\n`,
        ),
      )
      await installPackage(dependency, version)

}