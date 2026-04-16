# AGENT.md

## Project Overview

`microsandbox-web-ui` is a SvelteKit dashboard for managing Microsandbox runtimes from the browser.
It sits on top of the `microsandbox` Node SDK and local OCI metadata storage to provide:

- sandbox lifecycle control (create, start, stop, remove)
- runtime inspection (status, metrics, activity)
- image, layer, snapshot, and volume management
- operational setup actions (runtime install and diagnostics)

This app is an operator UI. It should stay simple, predictable, and server-first.

## North Star

Build a reliable, readable control panel for Microsandbox where every feature is:

1. backed by the official SDK
2. rendered with semantic HTML and zero CSS
3. implemented with clean SvelteKit patterns

---

## Rule 1: Microsandbox SDK Implementation

Use the upstream Microsandbox project as the source of truth:
`https://github.com/superradcompany/microsandbox`

### Implementation standards

- Use SDK APIs first. Do not shell out to `msb` when an SDK method exists.
- Keep all SDK calls on the server side (`+page.server.*`, `+layout.server.*`, `actions.remote.ts`, or `src/lib/server/*`).
- Never import server-only SDK code into browser bundles.
- Validate and normalize user input before invoking SDK operations.
- Convert SDK errors into clear, actionable UI messages.
- Treat SDK behavior as beta-compatible: fail safely, handle missing features gracefully, and avoid brittle assumptions.

### Integration patterns

- Centralize SDK interaction logic in dedicated server modules.
- Keep route files focused on orchestration, not low-level SDK plumbing.
- Prefer explicit return shapes for route data and action responses.
- Surface status changes quickly after lifecycle actions (start/stop/create/remove).
- Avoid hidden side effects; each action should do one obvious operation.

### Reliability and safety

- Use idempotent behavior where possible (safe re-runs, safe retries).
- Guard destructive actions (remove sandbox/image/volume) with strong intent checks.
- Log operational context without exposing secrets or sensitive payloads.
- Fail closed for privileged operations (install, admin actions, secret handling).

---

## Rule 2: Pure HTML, Zero CSS (In-Depth)

Design principle: use semantic HTML only. No styling layer.

### Hard constraints

- No custom CSS files.
- No `<style>` blocks in Svelte components.
- No inline `style=""` attributes.
- No CSS frameworks, utility class systems, or design token pipelines.

### Markup standards

- Structure pages with semantic elements (`main`, `section`, `article`, `header`, `nav`, `form`, `table`, `fieldset`).
- Use native HTML behavior before introducing client-side enhancements.
- Represent hierarchy and emphasis through heading structure and content, not visual styling tricks.
- Favor accessible, keyboard-friendly native controls.

### Practical UI approach

- Use clear content grouping and labels to communicate meaning.
- Prefer plain tables and lists for data-dense views.
- Keep forms explicit and predictable with proper labels and submit semantics.
- Preserve readable source order for accessibility and maintainability.

If a UI requirement cannot be met without CSS, simplify the requirement instead of introducing styles.

---

## Rule 3: Clean Code, SvelteKit (In-Depth)

Use idiomatic SvelteKit and keep code easy to reason about.

### Architecture and boundaries

- Keep data-fetching and mutations server-first.
- Use route groups and route-level boundaries intentionally (`(guest)`, `(authenticated)`).
- Place reusable logic in `src/lib` and server-only logic in `src/lib/server`.
- Avoid leaking infrastructure concerns into UI markup.

### Code quality standards

- Prefer small, focused modules and functions.
- Name things by domain intent, not implementation detail.
- Remove dead code and outdated comments quickly.
- Keep branching shallow and flows explicit.
- Avoid duplication by extracting shared helpers when repetition starts.

### SvelteKit conventions

- Use `load` for read paths.
- Use Svelte remote actions as the primary path for writes.
- Use remote actions for form submissions by default.
- Keep remote actions focused on mutations (create/update/delete/execute), not generic read fetching.
- Keep action contracts explicit and typed.
- Return structured, serializable data from server boundaries.
- Use redirects/errors intentionally and consistently.
- Do not move secrets or privileged values into client-visible payloads.

### Validation, errors, and observability

- Use Zod schemas to validate all external or user-supplied input.
- Validate remote action input before any side effects.
- Return user-safe error messages and preserve actionable logs server-side.
- Keep logs concise, contextual, and free of credentials/tokens.
- Prefer deterministic behavior over clever abstractions.

---

## Definition of Done (for new changes)

A change is done when it:

- follows SDK-first server integration patterns
- maintains pure HTML and zero CSS
- uses clean, idiomatic SvelteKit structure
- keeps security boundaries intact
- is understandable by reading the file once

When in doubt, choose the simpler implementation.
