# Fix: Vercel `pnpm install` failed after Vite -> Next.js migration

## Confirmed repository problem

At commit `a1ad457`, `package.json` declares Next.js, React 19, Tailwind v4 and Radix UI, but the tracked `pnpm-lock.yaml` still declares the OLD Vite toolchain under `importers: .:`. In CI, pnpm commonly freezes the lockfile by default, so install fails when dependencies change. The complete Vercel installation log was not provided; an additional issue is possible.

## Preferred permanent repair (recommended)

On a machine with npm-registry access, in the ROOT of the GitHub checkout (`wksn753/old-mutual-testcard`):

```powershell
corepack enable
corepack prepare pnpm@10.12.1 --activate
pnpm install --no-frozen-lockfile
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
git add package.json pnpm-lock.yaml
git commit -m "fix: update pnpm lockfile for Next.js migration"
git push origin main
```

If you copied the temporary `.npmrc` from this ZIP, DELETE it when the lockfile is updated and include the deletion in the same commit. Keeping CI's frozen-lockfile protection is preferable in a real deployment. Do not remove the generated lockfile from source control.

## Temporary quick deploy with this v5.1 ZIP

Copy the updated contents to the ROOT of the existing GitHub project. The included `.npmrc` sets `frozen-lockfile=false`, allowing Vercel's `pnpm install` to update the stale lockfile **in the build environment**. This can unblock the install but is a stopgap: build reproducibility is reduced, and the updated lockfile is not saved to GitHub. It does not guarantee `pnpm build` succeeds.

**IMPORTANT:** Copying a ZIP over an existing GitHub repo will not delete its old `pnpm-lock.yaml`. Regenerate and commit that file using the permanent repair commands above.

## If deployment still fails

Open Vercel > old-mutual-testcard > Deployments > failed deployment > Build Logs. Copy the first detailed `ERR_PNPM_*`, `npm ERR!`, or `Error:` section (not just `Command "pnpm install" exited with 1`). This will show whether there's a second issue, e.g. registry or Node version. If installation succeeds but build fails, share the `next build` error.

## Validation limits

The package registry was unreachable in the environment used to prepare this archive. I therefore did NOT generate or claim to verify a fresh lockfile, install dependencies, or run `next build`. The original project source and the targeted install configuration were checked locally.
