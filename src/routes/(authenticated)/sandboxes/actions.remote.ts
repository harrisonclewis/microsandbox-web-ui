import { form } from '$app/server';
import { invalid, redirect } from '@sveltejs/kit';
import { sandboxCreateFormSchema } from '$lib/server/microsandbox/sdk-form-schemas.js';
import { sdkCreateSandbox } from '$lib/server/microsandbox/service.js';

export const createSandbox = form(sandboxCreateFormSchema, async ({ payload }) => {
	const result = await sdkCreateSandbox(payload);
	if (!result.ok) {
		invalid(`${result.code}: ${result.message}`);
	}
	const mode = payload.detached ? 'detached' : 'attached';
	throw redirect(
		303,
		`/sandboxes?sdkCreated=${encodeURIComponent(result.data.name)}&mode=${encodeURIComponent(mode)}`
	);
});
