import { getRequestEvent } from '$app/server';
import { invalid, redirect } from '@sveltejs/kit';
import type { SdkResult } from './types.js';

const MAX_QUERY_SDK_OUT = 4000;

export function redirectWithNotice(notice: string): never {
	const { url } = getRequestEvent();
	const next = new URL(url.pathname + url.search, url.origin);
	next.searchParams.set('notice', notice);
	throw redirect(303, next.pathname + next.search);
}

export function redirectWithSdkOut(payload: unknown): never {
	const { url } = getRequestEvent();
	const s = JSON.stringify(payload);
	if (s.length > MAX_QUERY_SDK_OUT) {
		invalid('Result is too large to pass in the URL. Try a smaller output or use streaming with smaller chunks.');
	}
	const next = new URL(url.pathname + url.search, url.origin);
	next.searchParams.set('sdkOut', s);
	throw redirect(303, next.pathname + next.search);
}

export function assertSdkResult<T>(result: SdkResult<T>): asserts result is { ok: true; data: T } {
	if (!result.ok) {
		invalid(`${result.code}: ${result.message}`);
	}
}
