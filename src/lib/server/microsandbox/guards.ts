import { platform, arch } from 'node:os';
import { getMicrosandboxModule, isSdkInstalled } from './client.js';
import type { SdkCapabilities } from './types.js';
import { DEFAULT_CAPABILITIES } from './types.js';

/**
 * microsandbox native host support: Linux x64/arm64, darwin arm64 (per package optional deps).
 */
export function isSupportedSdkHost(): boolean {
	const p = platform();
	const a = arch();
	if (p === 'linux' && (a === 'x64' || a === 'arm64')) return true;
	if (p === 'darwin' && a === 'arm64') return true;
	return false;
}

export function getSdkCapabilities(): SdkCapabilities {
	const base = { ...DEFAULT_CAPABILITIES };
	base.supportedHost = isSupportedSdkHost();
	base.installed = isSdkInstalled();
	return base;
}

/** Module present on supported host (may still need `install()`). */
export function assertModuleLoaded():
	| { ok: true; msb: NonNullable<ReturnType<typeof getMicrosandboxModule>> }
	| { ok: false; message: string } {
	if (!isSupportedSdkHost()) {
		return {
			ok: false,
			message:
				'Microsandbox SDK requires a supported host (Linux x64/arm64 or macOS Apple Silicon). This server environment is not supported.'
		};
	}
	const msb = getMicrosandboxModule();
	if (!msb) {
		return {
			ok: false,
			message: 'Microsandbox native module failed to load. Reinstall dependencies on a supported platform.'
		};
	}
	return { ok: true, msb };
}

export function assertSdkUsable(): { ok: true; msb: NonNullable<ReturnType<typeof getMicrosandboxModule>> } | { ok: false; message: string } {
	const mod = assertModuleLoaded();
	if (!mod.ok) return mod;
	if (!mod.msb.isInstalled()) {
		return {
			ok: false,
			message: 'Microsandbox runtime is not installed. Use SDK install from Settings or run the CLI installer on the server.'
		};
	}
	return { ok: true, msb: mod.msb };
}
