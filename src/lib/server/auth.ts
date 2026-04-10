import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'node:crypto';
import * as v from 'valibot';

export type AuthenticationPayload = {
	iat: number;
	exp: number;
};

type AuthenticatedSession = {
	expiresAt: number;
};

type CookieOptions = {
	path: string;
	httpOnly: boolean;
	secure: boolean;
	sameSite: 'lax' | 'strict' | 'none';
};

type Authentication = {
	cookieName: string;
	defaultCookieAge: number;
	cookieOptions: CookieOptions;
	getEncryptionKey: () => string;
	get: (encodedPayload: string) => AuthenticationPayload | null;
	create: () => string;
	verify: (cookieValue: string | undefined) => AuthenticatedSession | null;
	sign: (value: string) => string;
	options: () => CookieOptions & { maxAge: number };
	delete: (cookies: Cookies) => void;
};

export const auth: Authentication = {
	cookieName: 'session',
	defaultCookieAge: 60 * 60 * 24 * 7,
	cookieOptions: {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax'
	},
	getEncryptionKey: (): string => {
		const key = env.ENCRYPTION_KEY;

		if (!key) {
			throw new Error('ENCRYPTION_KEY is not set');
		}

		return key;
	},
	get: (encodedPayload: string): AuthenticationPayload | null => {
		try {
			const decoded = Buffer.from(encodedPayload, 'base64url').toString('utf8');
			const payload = JSON.parse(decoded);
			const result = v.safeParse(v.object({
				iat: v.pipe(v.number(), v.integer()),
				exp: v.pipe(v.number(), v.integer())
			}), payload);
			
			if (!result.success) {
				return null;
			}

			return result.output;
		} catch {
			return null;
		}
	},
	create: (): string => {
		const now = Math.floor(Date.now() / 1000);
		const payload: AuthenticationPayload = {
			iat: now,
			exp: now + auth.defaultCookieAge
		};
		const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
		const signature = auth.sign(encodedPayload);

		return `${encodedPayload}.${signature}`;
	},
	verify: (cookieValue: string | undefined): AuthenticatedSession | null => {
		if (!cookieValue) {
			return null;
		}

		const [encodedPayload, signature] = cookieValue.split('.');
		if (!encodedPayload || !signature) {
			return null;
		}

		const expectedSignature = auth.sign(encodedPayload);
		const signatureBuffer = Buffer.from(signature);
		const expectedSignatureBuffer = Buffer.from(expectedSignature);
		if (signatureBuffer.length !== expectedSignatureBuffer.length) {
			return null;
		}

		const isValidSignature = timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
		if (!isValidSignature) {
			return null;
		}

		const payload = auth.get(encodedPayload);
		if (!payload) {
			return null;
		}

		const now = Math.floor(Date.now() / 1000);
		if (payload.exp <= now) {
			return null;
		}

		return {
			expiresAt: payload.exp
		};
	},
	sign: (value: string): string => {
		return createHmac('sha256', auth.getEncryptionKey()).update(value).digest('base64url');
	},
	options: () => {
		return {
			...auth.cookieOptions,
			maxAge: auth.defaultCookieAge
		};
	},
	delete: (cookies: Cookies): void => {
		cookies.delete(auth.cookieName, {
			path: auth.cookieOptions.path
		});
	}
};