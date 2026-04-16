# Microsandbox Web UI

A SvelteKit dashboard for managing and observing [Microsandbox](https://github.com/superradcompany/microsandbox) — the self-hosted platform for running untrusted code in hardware-isolated microVMs.

This project provides a browser interface on top of the [`microsandbox`](https://www.npmjs.com/package/microsandbox) Node SDK and the local OCI metadata database, giving you a read/write view of sandboxes, images, layers, snapshots, volumes, and runtime activity.

---

## Features

- **Dashboard** — live view of sandbox runtime, CPU, RAM, and image usage pulled from the Microsandbox SDK.
- **Sandboxes** — list, inspect, create, start, stop, and remove sandboxes; parse and display sandbox config (CPU, memory, image, network, patches).
- **Images / Layers / Manifests / Configs** — browse the local OCI metadata with pagination and detail pages, backed by the Microsandbox SQLite/libsql store.
- **Snapshots & Volumes** — view, create, and remove persistent state.
- **Activity** — recent sandbox lifecycle events.
- **Settings** — install/manage the `msb` runtime + `libkrunfw` on the server, plus database diagnostics.
- **Auth** — token-based login, rate limiting, and encryption helpers for the admin surface.

---

## Requirements

| Requirement | Notes |
|---|---|
| **Node.js 20+** or **[Bun](https://bun.sh)** | Bun is recommended (repo ships a `bun.lock`). |
| **Microsandbox host** | Runs **on the server side** only. Supported: **Linux x64/arm64** and **macOS Apple Silicon**. The SDK is **not supported on Windows hosts** — use WSL2, a Linux VM, or a remote Linux server. |

> The SvelteKit frontend will develop fine on any OS, but server-side SDK calls (install, start, stop, metrics) require a supported host.

---

## Related projects

- [Microsandbox](https://github.com/superradcompany/microsandbox) — the core runtime this UI drives.
- [`microsandbox` npm package](https://www.npmjs.com/package/microsandbox) — the Node SDK used by this server.

---

## Installation

```sh
# 1. Clone
git clone https://github.com/superradcompany/microsandbox-web-ui.git
cd microsandbox-web-ui

# 2. Install dependencies
bun install
# or
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
# Required — browser login token. Use a long random string.
ACCESS_TOKEN="replace-with-a-long-random-secret"

# Required — path to the Microsandbox SQLite database. Found in .microsandbox/db/msb.db
# Example for a local file:
DATABASE_URL="file:./example.db"

# Required — 32-byte key used to encrypt stored secrets.
ENCRYPTION_KEY="replace-with-a-32-byte-random-hex"

# Optional — enables the Settings → SDK page that can install
# `msb` + `libkrunfw` on the server. Use a separate long random secret.
MSB_ADMIN_INSTALL_TOKEN="replace-with-another-long-random-secret"
```

| Variable | Required | Purpose |
|---|---|---|
| `ACCESS_TOKEN` | Yes | Shared secret used by the login form. |
| `DATABASE_URL` | Yes | libsql/SQLite URL for the Microsandbox metadata DB. |
| `ENCRYPTION_KEY` | Yes | Key used by `src/lib/server/auth.ts` for at-rest encryption. |
| `MSB_ADMIN_INSTALL_TOKEN` | Optional | Unlocks the **Settings → SDK** install form. |

---

## Running

### Development

```sh
bun run dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173), log in with your `ACCESS_TOKEN`, and the dashboard will connect to the Microsandbox SDK running on the same host.

### Production build

```sh
bun run build
bun run preview
```

You may need a [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) for your deployment target.

### Install the Microsandbox runtime

If `msb` / `libkrunfw` are not yet present on the server:

1. Start the app and log in.
2. Go to **Settings → SDK**.
3. Enter your `MSB_ADMIN_INSTALL_TOKEN` and submit. This triggers `install()` on the server and downloads the runtime (requires network access on the host).

Alternatively, follow the instructions in the [Microsandbox repo](https://github.com/superradcompany/microsandbox) to install `msb` manually.

---

## Tech stack

- [SvelteKit 2](https://svelte.dev/docs/kit) + [Svelte 5](https://svelte.dev)
- [Vite 8](https://vite.dev)
- [`microsandbox`](https://www.npmjs.com/package/microsandbox) SDK
- [Drizzle ORM](https://orm.drizzle.team) on [libsql](https://github.com/tursodatabase/libsql)
- [Zod](https://zod.dev) + [Valibot](https://valibot.dev) for validation
- TypeScript

---

## License

See the [Microsandbox](https://github.com/superradcompany/microsandbox) project for upstream licensing. This UI is distributed under the same terms unless stated otherwise in this repository.
