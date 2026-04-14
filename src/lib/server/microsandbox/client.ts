import { createRequire } from 'node:module';
import type * as Microsandbox from 'microsandbox';

type MicrosandboxModule = typeof Microsandbox;

let cached: MicrosandboxModule | null | undefined;

/**
 * Load native microsandbox binding (CJS). Returns null if load fails (unsupported platform, missing binary).
 */
export function getMicrosandboxModule(): MicrosandboxModule | null {
	if (cached !== undefined) return cached;
	try {
		const require = createRequire(import.meta.url);
		cached = require('microsandbox') as MicrosandboxModule;
	} catch {
		cached = null;
	}
	return cached;
}

export function isSdkInstalled(): boolean {
	const m = getMicrosandboxModule();
	if (!m) return false;
	try {
		return m.isInstalled();
	} catch {
		return false;
	}
}
