import { createRequire } from 'node:module';
import type * as Microsandbox from 'microsandbox';
import { arch, platform } from 'node:os';

type MicrosandboxModule = typeof Microsandbox;

let msbModule: MicrosandboxModule | undefined;

export function msb(): MicrosandboxModule {
	if (msbModule !== undefined) {
		return msbModule;
	}

	if (!isSupportedSdkHost()) {
		throw new Error("Microsandbox not supported on this platform");
	}

	try {
		const require = createRequire(import.meta.url);

		msbModule = require('microsandbox') as MicrosandboxModule;

		if (!msbModule) {
			throw new Error("Microsandbox native module failed to load. Reinstall dependencies on a supported platform.");
		}

		return msbModule;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error("Microsandbox not initialized: " + err.message);
		}

		throw new Error("Microsandbox not initialized");
	}
}

export function isSupportedSdkHost(): boolean {
	const p = platform();
	const a = arch();
	
	if (p === 'linux' && (a === 'x64' || a === 'arm64')) {
		return true;
	}

	if (p === 'darwin' && a === 'arm64') {
		return true;
	}

	return false;
}