import { createRequire } from 'node:module';
import type * as Microsandbox from 'microsandbox';

type MicrosandboxModule = typeof Microsandbox;

let msbModule: MicrosandboxModule | undefined;

/**
 * Load native microsandbox binding (CJS). Returns null if load fails (unsupported platform, missing binary).
 */
export function msb(): MicrosandboxModule {
	if (msbModule !== undefined) {
		return msbModule;
	}

	try {
		const require = createRequire(import.meta.url);

		msbModule = require('microsandbox') as MicrosandboxModule;

		if (!msbModule) {
			throw new Error("Microsandbox not initialized");
		}

		return msbModule;
	} catch {
		throw new Error("Microsandbox not initialized");
	}
}