# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.15.0 create --template minimal --types ts --add drizzle="database:sqlite+sqlite:libsql" mdsvex --install bun microsandbox-web-ui
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Microsandbox SDK (server)

- The `microsandbox` npm package runs **on the SvelteKit server** (supported: **Linux x64/arm64**, **macOS Apple Silicon**). It is not a supported host on Windows.
- Set **`MSB_ADMIN_INSTALL_TOKEN`** (long random secret) to enable the **Settings → SDK** form that calls `install()` to download msb + libkrunfw on the host (requires network on the server).
- Existing **`ACCESS_TOKEN`** is still used for browser login. **`DATABASE_URL`** is required for the read-only SQLite/libsql UI.
