import { query } from "$app/server";
import { normalizeSandboxName } from "$lib/server/sandbox-name";
import { msb } from "$lib/server/microsandbox";
import * as v from "valibot";
import type { Sandbox, SandboxHandle } from "microsandbox";

/** Guest path for list(): absolute, no trailing slash except root. */
function normalizeGuestPath(raw: string | undefined): string {
	const trimmed = (raw ?? "").trim();

	if (!trimmed) {
		return "/";
	}

	let p = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

	if (p.length > 1 && p.endsWith("/")) {
		p = p.slice(0, -1);
	}

	return p;
}

const listSandboxFilesSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)),
	path: v.optional(v.pipe(v.string(), v.maxLength(4096))),
});

export type SandboxFileEntryRow = {
	path: string;
	kind: string;
	size: number;
	modified?: number;
	mode: number;
};

export type ListSandboxFilesData = {
	path: string;
	entries: SandboxFileEntryRow[];
};

export const listSandboxFiles = query(listSandboxFilesSchema, async (input) => {
	const normalizedName = normalizeSandboxName(input.name);
	const guestPath = normalizeGuestPath(input.path);

	try {
		msb();
	} catch {
		throw new Error("Microsandbox is not available on this host.");
	}

	let handle: SandboxHandle | null = null;

	try {
		handle = await msb().Sandbox.get(normalizedName);
	} catch {
		throw new Error("Sandbox not found.");
	}

	if (!handle) {
		throw new Error("Sandbox not found.");
	}

	if (handle.status !== "running") {
		throw new Error(`Sandbox must be running to list files. Current status: ${handle.status}`);
	}

	let live: Sandbox | null = null;

	try {
		live = await handle.connect();
		const entries = await live.fs().list(guestPath);

		const sorted = [...entries].sort((a, b) => {
			const ad = a.kind === "directory" ? 0 : 1;
			const bd = b.kind === "directory" ? 0 : 1;

			if (ad !== bd) {
				return ad - bd;
			}

			return a.path.localeCompare(b.path);
		});

		return {
			data: {
				path: guestPath,
				entries: sorted.map((e) => ({
					path: e.path,
					kind: e.kind,
					size: e.size,
					modified: e.modified,
					mode: e.mode,
				})),
			} satisfies ListSandboxFilesData,
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to list files at ${guestPath}: ${message}`);
	} finally {
		if (live) {
			try {
				await live.detach();
			} catch {
				// best-effort
			}
		}
	}
});
