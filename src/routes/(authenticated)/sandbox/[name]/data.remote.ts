import { command, query } from "$app/server";
import { normalizeSandboxName } from "$lib/server/sandbox-name";
import { msb } from "$lib/server/microsandbox";
import { toSandboxInfoWithConfig } from "$lib/types";
import * as v from "valibot";
import type { SandboxHandle } from "microsandbox";

const sandboxNameSchema = v.pipe(v.string(), v.nonEmpty(), v.maxLength(128));

export const getSandbox = query(sandboxNameSchema, async (name) => {
	const normalizedName = normalizeSandboxName(name);
	let sandbox: SandboxHandle | null = null;

	try {
		sandbox = await msb().Sandbox.get(normalizedName);
	} catch {
		return { data: null };
	}

	if (!sandbox) {
		return { data: null };
	}

	return {
		data: toSandboxInfoWithConfig(sandbox),
	};
});

export const startSandbox = command(sandboxNameSchema, async (name) => {
	const normalizedName = normalizeSandboxName(name);
	const sandbox = await msb().Sandbox.get(normalizedName);

	if (!sandbox) {
		throw new Error(`Sandbox ${normalizedName} not found`);
	}

	try {
		await sandbox.startDetached();
	} catch (error) {
		// Some runtimes may tear down the control connection during startup
		// while the sandbox itself still transitions to running.
		try {
			const refreshed = await msb().Sandbox.get(normalizedName);
			if (refreshed.status === "running") {
				return { data: null };
			}
		} catch {
			// Ignore fallback read failure and return the original error context below.
		}

		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Failed to start sandbox ${normalizedName}. The runtime connection was interrupted during startup. ${errorMessage}`
		);
	}

	return { data: null };
});

export const stopSandbox = command(sandboxNameSchema, async (name) => {
	const normalizedName = normalizeSandboxName(name);
	const sandbox = await msb().Sandbox.get(normalizedName);

	if (!sandbox) {
		throw new Error(`Sandbox ${normalizedName} not found`);
	}

	try {
		await sandbox.stop();
	} catch (error) {
		throw new Error(`Failed to stop sandbox ${normalizedName}: ${error instanceof Error ? error.message : String(error)}`);
	}

	return { data: null };
});

export const killSandbox = command(sandboxNameSchema, async (name) => {
	const normalizedName = normalizeSandboxName(name);
	const sandbox = await msb().Sandbox.get(normalizedName);

	if (!sandbox) {
		throw new Error(`Sandbox ${normalizedName} not found`);
	}

	try {
		await sandbox.kill();
	} catch (error) {
		throw new Error(`Failed to kill sandbox ${normalizedName}: ${error instanceof Error ? error.message : String(error)}`);
	}

	return { data: null };
});

export const removeSandbox = command(sandboxNameSchema, async (name) => {
	const normalizedName = normalizeSandboxName(name);
	const sandbox = await msb().Sandbox.get(normalizedName);

	if (!sandbox) {
		throw new Error(`Sandbox ${normalizedName} not found`);
	}

	try {
		await sandbox.remove();
	} catch (error) {
		throw new Error(`Failed to remove sandbox ${normalizedName}: ${error instanceof Error ? error.message : String(error)}`);
	}

	return { data: null };
});