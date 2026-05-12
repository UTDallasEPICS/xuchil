# Xuchil

## Prerequisites

In order to run this project, a few technologies are required:

- [Node.js](https://nodejs.org)

If you have these installed already, you can skip to [running this project](#running-this-project).

Node.js is what allows us to write all our applications in JavaScript. Usually, JavaScript is run only in a web browser. By building on top of Node.js, we can write code that is executed on the server, simpler to write, and/or more secure.

### Installing Node

#### Node for Windows

On windows, you can install node from the [Node.js downloads page](https://nodejs.org/en/download). Make sure you install the LTS (long-term support) version! Download and run the installer.

:warning: If shown a check box to install "tools for native modules" make sure you check the box before clicking next :warning:

Once the installation is finished (and you have restarted you computer if prompted), you can continue to [installing Docker](#installing-docker).

#### Node for Mac/Linux

It is recommended to use [node version manager (nvm)](https://github.com/nvm-sh/nvm) to install and run node on Mac/Linux. You can install is by using the command found [here](https://github.com/nvm-sh/nvm#installing-and-updating) in your terminal application. Alternatively, you can follow the installation instructions in the [windows instructions](#node-for-windows).

Once you have installed node version manager installed, run the following commands in your terminal:

```bash
nvm install --lts # Install latest version of Node.js
nvm install-latest-npm # Update npm to latest version
```

These commands do the following:

1. Install the long-term support (LTS) version of Node. The LTS version is the version of Node that will receive security updates the longest.
2. Update the node package manager (npm) to the latest version.

This completes your installation of Node!

### Installing pnpm (recommended/optional)

pnpm is an improved version of the Node Package Manager (npm). Though not required, it is highly recommended that you install it. You can install it using the following command in your terminal/powershell after node has been installed

```bash
npm install -g pnpm
```

If you choose to install pnpm, then you can substitute all usage of 'npm' with 'pnpm' and all usage of 'npx' with 'pnpx'. Additionally, you can create an alias in your `.bashrc` (Linux) or `.zshrc` (Mac) files. This will mean that when you type in npm or npx, pnpm and pnpx will be substituted. Use the following commands to add the aliases to the corresponding file:

```bash
# Linux
echo 'alias npm="pnpm"' >> .bashrc

# Mac
echo 'alias npm="pnpm"' >> .zshrc
```

## Running This Project

Make sure dependencies are installed:
```bash
npm install
# or
pnpm install
# remember to run pnpm post install scripts if prompted
```

First, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Deployment

Copy [`.env.example`](.env.example) to `.env.local` (local) or configure the same variables in your hosting provider.

Required variables:

- `SESSION_SECRET`: long random secret shared by every running instance.
- `DATABASE_URL`: defaults to `file:./dev.db` for SQLite. On ephemeral hosts, point this to a persistent path or mounted volume.

Optional variables:

- `CORS_ALLOWED_ORIGINS`: comma-separated allowlist for cross-origin browser clients. Leave unset when the UI and `/api` are served from the same origin.

Recommended startup on a fresh host:

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm prisma:seed:users-clean
pnpm prisma:seed:minimal
pnpm prisma:seed:processes
pnpm build
pnpm start
```

Or use `pnpm system:init:prod:start` / `pnpm system:init:prod:offline:start`.

Serve the app over HTTPS in production. Session cookies are marked `Secure` when `NODE_ENV=production`.

### Production troubleshooting

Open `/api/health` on the deployed host. It reports whether `SESSION_SECRET` is configured, whether SQLite is reachable, and whether CORS allowlist is enabled.

| Signal | Likely cause |
| --- | --- |
| Browser console shows `blocked by CORS policy` or failed `OPTIONS` | Cross-origin client without `CORS_ALLOWED_ORIGINS` |
| `401` on `/api/*` after a successful login | Missing or mismatched `SESSION_SECRET`, or session cookie not sent |
| Redirect loop to `/login` | Invalid session cookie, HTTP instead of HTTPS, or blocked cookie |
| `502`, timeout, or blank page | Build/start failure, wrong port, or platform health check |
| `500` on login | SQLite not initialized, missing migrations/seed, or non-persistent database |

## Learn More

### Learn Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Official Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Official Next.js with Prisma Example](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nextjs-api-routes)

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Learn Prisma

To learn more about Prisma, take a look at the following resources:

- [Prisma Documentation](https://www.prisma.io/docs)
- [Learn Prisma](https://www.prisma.io/learn)
- [Official Prisma Examples](https://github.com/prisma/prisma-examples)


This is a Next.js, Prisma, and SQLite project based on the UTDEpics Next.js template
