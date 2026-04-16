import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { msb } from '$lib/server/microsandbox';

function hasValidMicrosandboxMethod(
	microsandbox: ReturnType<typeof msb>
): microsandbox is ReturnType<typeof msb> & { Sandbox: { list: () => Promise<unknown> } } {
	return (
		typeof microsandbox === 'object' &&
		microsandbox !== null &&
		typeof microsandbox.Sandbox?.list === 'function'
	);
}

export const load: LayoutServerLoad = async () => {
	try {
		const microsandbox = msb();

		if (!hasValidMicrosandboxMethod(microsandbox)) {
			throw new Error('Invalid microsandbox module');
		}

		return {};
	} catch (err) {
		if (err instanceof Error) {
			throw error(500, err.message);
		}

		throw error(500, 'Unable to initalize microsandbox: Unknown error');
	}
};
