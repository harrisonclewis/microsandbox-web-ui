/** Action / API response envelope for SDK-backed remotes */
export type SdkOk<T> = { ok: true; data: T };
export type SdkErr = {
	ok: false;
	code: string;
	message: string;
	details?: unknown;
};
export type SdkResult<T> = SdkOk<T> | SdkErr;

export function sdkOk<T>(data: T): SdkOk<T> {
	return { ok: true, data };
}

export function sdkErr(code: string, message: string, details?: unknown): SdkErr {
	return { ok: false, code, message, ...(details !== undefined ? { details } : {}) };
}

/** Capabilities exposed to UI (docs vs installed SDK) */
export type SdkCapabilities = {
	supportedHost: boolean;
	installed: boolean;
	snapshots: boolean;
	events: boolean;
	version: string;
};

export const DEFAULT_CAPABILITIES: SdkCapabilities = {
	supportedHost: false,
	installed: false,
	snapshots: false,
	events: false,
	version: '0.3.12'
};
