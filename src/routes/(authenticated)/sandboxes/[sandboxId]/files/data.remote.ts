import { query } from '$app/server';
import { getSandboxNameFromRouteParam } from '$lib/server/sandbox-route';

export const getSandboxFileContext = query(async () => {
	const sandboxName = await getSandboxNameFromRouteParam();
	return { sandboxName };
});
