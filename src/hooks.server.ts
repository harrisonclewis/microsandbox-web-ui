import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { RateLimiter } from '$lib/server/rate-limit';

const GlobalRateLimiter = new RateLimiter(200, 60_000);

const AuthenticatedRouteId = '(authenticated)';
const AuthenticatedHomeRoute = '/dashboard';

const GuestRouteId = '(guest)';
const GuestHomeRoute = '/';

function handleAuthentication(event: Parameters<Handle>[0]['event']): void {
	const cookieValue = event.cookies.get(auth.cookieName);
	const session = auth.verify(cookieValue);

	event.locals.auth = !!session;
	
	if (cookieValue && !session) {
		auth.delete(event.cookies);
	}

	if (!event.locals.auth && routeIncludes(event.route.id, AuthenticatedRouteId)) {
		throw redirect(303, GuestHomeRoute);
	}

	if (event.locals.auth && routeIncludes(event.route.id, GuestRouteId)) {
		throw redirect(303, AuthenticatedHomeRoute);
	}
}

function handleGlobalRateLimit(event: Parameters<Handle>[0]['event']): Response | undefined {
	const clientAddress = event.getClientAddress();
	
	if (GlobalRateLimiter.isLimited(clientAddress)) {
		return new Response('Too many attempts. Try again later.', { status: 429 });
	}

	GlobalRateLimiter.hit(clientAddress);
}

export const handle: Handle = async ({ event, resolve }) => {
	const RateLimitedResponse = handleGlobalRateLimit(event);

	if (RateLimitedResponse) {
		return RateLimitedResponse;
	}

	handleAuthentication(event);

	return resolve(event);
};

function routeIncludes(routeId: string | null, includes: string): boolean {
	if (!routeId) {
		return false;
	}

	return routeId.includes(includes);
}