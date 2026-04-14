import { form } from '$app/server';
import * as v from 'valibot';
import { env } from '$env/dynamic/private';
import { invalid } from '@sveltejs/kit';
import { sdkInstall } from '$lib/server/microsandbox/service.js';
import { assertSdkResult, redirectWithNotice } from '$lib/server/microsandbox/action-redirect.js';

/**
 * Downloads/installs msb + libkrunfw on the server host.
 * Requires `MSB_ADMIN_INSTALL_TOKEN` in private env and matching `adminToken` in the form.
 */
export const installMicrosandboxRuntime = form(
	v.object({
		adminToken: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ adminToken }) => {
		const expected = env.MSB_ADMIN_INSTALL_TOKEN;
		if (!expected || expected.length < 8) {
			invalid('MSB_ADMIN_INSTALL_TOKEN is not configured on the server.');
		}
		if (adminToken !== expected) {
			invalid('Invalid admin token.');
		}
		const result = await sdkInstall();
		assertSdkResult(result);
		redirectWithNotice('Microsandbox runtime install completed. Refresh diagnostics below.');
	}
);
