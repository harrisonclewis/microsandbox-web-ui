import { form } from "$app/server";
import * as v from 'valibot';
import { env } from "$env/dynamic/private";
import { invalid, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { RateLimiter } from "$lib/server/rate-limit";
import { getRequestEvent } from "$app/server";
import { timingSafeEqual } from "crypto";

const AuthRateLimiter = new RateLimiter(5, 60_000);

export const authenticate = form(
    v.object({
        accessToken: v.pipe(
            v.string(), 
            v.nonEmpty(), 
            v.maxLength(120),
        ),
    }),
    async ({ accessToken }) => {
        const { getClientAddress, cookies } = getRequestEvent();
        const clientAddress = getClientAddress();

        if (AuthRateLimiter.isLimited(clientAddress)) {
            invalid("Too many login attempts. Try again later.");
        }

        AuthRateLimiter.hit(clientAddress);

        if (!env.ACCESS_TOKEN) {
            invalid("The environment ACCESS_TOKEN is not present.");
        }

        const inputBuffer = Buffer.from(accessToken);
        const expectedBuffer = Buffer.from(env.ACCESS_TOKEN);

        if (
            inputBuffer.length !== expectedBuffer.length
            || !timingSafeEqual(inputBuffer, expectedBuffer)
        ) {
            invalid("Invalid access token.");
        }

        cookies.set(auth.cookieName, auth.create(), auth.options());

        redirect(303, "/dashboard");
    }
);