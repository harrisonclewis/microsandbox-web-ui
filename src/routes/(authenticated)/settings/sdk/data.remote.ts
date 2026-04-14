import { query } from '$app/server';
import { getSdkCapabilities } from '$lib/server/microsandbox/guards.js';
import { sdkListSandboxes } from '$lib/server/microsandbox/service.js';

export const getSdkDiagnostics = query(async () => {
	const capabilities = getSdkCapabilities();
	let sandboxes: Awaited<ReturnType<typeof sdkListSandboxes>> | null = null;
	if (capabilities.supportedHost && capabilities.installed) {
		sandboxes = await sdkListSandboxes();
	}
	return {
		capabilities,
		sandboxes
	};
});
