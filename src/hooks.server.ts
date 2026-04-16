import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { RateLimiter } from '$lib/server/rate-limit';

const GlobalRateLimiter = new RateLimiter(200, 60_000);

const AuthenticatedRouteId = '(authenticated)';
const AuthenticatedHomeRoute = '/dashboard';

const GuestRouteId = '(guest)';
const GuestHomeRoute = '/';

function routeIncludes(routeId: string | null, includes: string): boolean {
	if (!routeId) {
		return false;
	}

	return routeId.includes(includes);
}

function handleAuthRedirect(event: Parameters<Handle>[0]['event']): void {
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

function getClientAddressForRateLimit(event: Parameters<Handle>[0]['event']): string {
	try {
		return event.getClientAddress();
	} catch {
		// Vite dev (and some proxies) cannot resolve a client address; avoid 500s.
		return "unknown";
	}
}

function handleGlobalRateLimit(event: Parameters<Handle>[0]['event']): Response | undefined {
	const clientAddress = getClientAddressForRateLimit(event);

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

	handleAuthRedirect(event);

	return resolve(event);
};