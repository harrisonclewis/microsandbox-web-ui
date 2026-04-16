<div align="center">
    <a href="./#gh-dark-mode-only" target="_blank" align="center">
        <img width="35%" src="\src\lib\assets\microsandbox-gh-banner-dark.png" alt="microsandbox-banner-xl-dark">
    </a>
</div>

<div align="center">
    <a href="./#gh-light-mode-only" target="_blank">
        <img width="35%" src="\src\lib\assets\microsandbox-gh-banner-light.png" alt="microsandbox-banner-xl">
    </a>
</div>

<br />

<div align="center"><b>——&nbsp;&nbsp;&nbsp;every agent deserves its own computer&nbsp;&nbsp;&nbsp;——</b></div>

<br />
<br />

<div align='center'>
  <img src="https://img.shields.io/badge/SvelteKit-2.x-ff3e00?style=for-the-badge&logo=svelte" alt="SvelteKit">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Microsandbox-SDK-A770EF?style=for-the-badge" alt="Microsandbox SDK">
</div>

<br />

**Microsandbox Web UI** is an early-stage, UI-first control plane for microsandbox. The long-term goal is full lifecycle management from a single authenticated web interface, so teams do not need to interact with microsandbox directly.

##

- <img height="14" src="https://octicons-col.vercel.app/shield-lock/A770EF"> **Authentication & Sessions**: Access-token login, signed HTTP-only cookies, and defensive auth checks.
- <img height="14" src="https://octicons-col.vercel.app/table/A770EF"> **Sandbox Inventory**: Unified listing for name, status, image, CPU, memory, and lifecycle metadata.
- <img height="14" src="https://octicons-col.vercel.app/play/A770EF"> **Lifecycle Actions**: Create, start, stop, restart, and remove sandboxes from the UI.
- <img height="14" src="https://octicons-col.vercel.app/terminal/A770EF"> **Exec & Session Control**: Run commands, attach terminals, and manage running workloads.
- <img height="14" src="https://octicons-col.vercel.app/sliders/A770EF"> **Configuration Management**: Edit image, compute, mounts, env vars, networking, and policy settings.
- <img height="14" src="https://octicons-col.vercel.app/key/A770EF"> **Secrets & Security Policies**: Manage secrets, egress rules, and sandbox-level protections.
- <img height="14" src="https://octicons-col.vercel.app/database/A770EF"> **Volumes & Persistence**: Attach data volumes and manage persistent workspace state.
- <img height="14" src="https://octicons-col.vercel.app/package/A770EF"> **Image & Registry Operations**: Pull, inspect, and manage OCI images used by sandboxes.
- <img height="14" src="https://octicons-col.vercel.app/graph/A770EF"> **Observability**: Surface logs, metrics, and runtime health in one place.
- <img height="14" src="https://octicons-col.vercel.app/history/A770EF"> **Auditability**: Track operational actions for safer team workflows.
- <img height="14" src="https://octicons-col.vercel.app/plug/A770EF"> **Automation & Integrations**: Connect with agent and platform workflows through a stable UI layer.
- <img height="14" src="https://octicons-col.vercel.app/beaker/A770EF"> **Current Stage**: Early-stage build with core auth and sandbox visibility available now.


<br />

## <a href="./#gh-dark-mode-only" target="_blank"><img height="13" src="https://octicons-col.vercel.app/rocket/ffffff" alt="rocket-dark"></a><a href="./#gh-light-mode-only" target="_blank"><img height="13" src="https://octicons-col.vercel.app/rocket/000000" alt="rocket"></a>&nbsp;&nbsp;Getting Started

#### <img height="14" src="https://octicons-col.vercel.app/move-to-bottom/A770EF">&nbsp;&nbsp;Install Dependencies

> ```sh
> npm install
> ```

#### <img height="14" src="https://octicons-col.vercel.app/download/A770EF">&nbsp;&nbsp;Configure Environment

> ```sh
> cp .env.example .env
> ```
>
> Set `ACCESS_TOKEN` and `ENCRYPTION_KEY` in `.env` before starting the app.

#### <img height="14" src="https://octicons-col.vercel.app/play/A770EF">&nbsp;&nbsp;Run the App

> ```sh
> npm run dev
> ```

##

> **Requirements**: Node.js 20+ and a compatible microsandbox runtime environment.<br />
> **Warning**: This project is early-stage. The feature surface is expanding toward full lifecycle management.

<br />
## <a href="./#gh-dark-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/book/ffffff" alt="docs-dark"></a><a href="./#gh-light-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/book/000000" alt="docs"></a>&nbsp;&nbsp;Documentation

For runtime behavior and API details, see [microsandbox documentation](https://docs.microsandbox.dev). For framework details, see [SvelteKit documentation](https://svelte.dev/docs/kit/introduction).

<a href="https://docs.microsandbox.dev/sdk/overview"><img src="https://img.shields.io/badge/Microsandbox_SDK_Docs-%E2%86%92-A770EF?style=flat-square&labelColor=2b2b2b" alt="Microsandbox SDK Docs"></a>

<br />

## <a href="./#gh-dark-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/gear/ffffff" alt="contributing-dark"></a><a href="./#gh-light-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/gear/000000" alt="contributing"></a>&nbsp;&nbsp;Contributing

Contributions are welcome. Prioritize small, focused changes that improve authentication safety, dashboard clarity, and microsandbox integration quality.

<br />

## <a href="./#gh-dark-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/law/ffffff" alt="license-dark"></a><a href="./#gh-light-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/law/000000" alt="license"></a>&nbsp;&nbsp;License

This project is licensed under the [Apache License 2.0](./LICENSE).

<br />

## <a href="./#gh-dark-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/heart/ffffff" alt="acknowledgements-dark"></a><a href="./#gh-light-mode-only" target="_blank"><img height="18" src="https://octicons-col.vercel.app/heart/000000" alt="acknowledgements"></a>&nbsp;&nbsp;Acknowledgements

Thanks to the microsandbox maintainers and ecosystem for making local microVM workflows easier to adopt in developer tooling.
