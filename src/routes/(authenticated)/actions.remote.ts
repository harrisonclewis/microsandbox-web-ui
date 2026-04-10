import { form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const logout = form(async () => {
	const { cookies } = getRequestEvent();
	
	auth.delete(cookies);

	redirect(303, '/');
});
