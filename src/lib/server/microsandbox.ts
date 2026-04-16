import { createRequire } from 'node:module';
import type * as Microsandbox from 'microsandbox';

type MicrosandboxModule = typeof Microsandbox;

let msb: MicrosandboxModule | null | undefined;

/**
 * Load native microsandbox binding (CJS). Returns null if load fails (unsupported platform, missing binary).
 */
export function getMsb(): MicrosandboxModule | null {
	if (msb !== undefined) {
		return msb;
	}

	try {
		const require = createRequire(import.meta.url);

		msb = require('microsandbox') as MicrosandboxModule;
	} catch {
		msb = null;
	}

	return msb;
}