This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash

npm run dev

# or

yarn dev

# or

pnpm dev

# or

bun dev

```



Open http://localhost:3000 in your browser.



You can edit the app starting at [app/page.js](app/page.js). Changes reload automatically.



**Build / Production**



```bash

npm run build

npm start

```



**Troubleshooting**



- If you see auth or API errors, confirm your keys are set in `.env.local` and that you restarted the dev server after changing the file.

- If installs fail, delete `node_modules` and lockfile (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`) then reinstall.

- Port conflicts: set `PORT` env var before starting, e.g. `PORT=3001 npm run dev` (Windows PowerShell: `$env:PORT=3001; npm run dev`).



**Deploying**



On Vercel, set the same environment variables in the project settings (do not upload `.env.local`).



---



## Learn More



- [Next.js Documentation](https://nextjs.org/docs)

- [Learn Next.js](https://nextjs.org/learn)



## Deploy on Vercel



Deploy with Vercel for the easiest experience: https://vercel.com/new 