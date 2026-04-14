import { form, getRequestEvent } from '$app/server';
import { redirect, invalid } from '@sveltejs/kit';
import * as v from 'valibot';
import { assertSandboxNameMatches, getSandboxNameFromRouteParam } from '$lib/server/sandbox-route';
import { sandboxNameSchema } from '$lib/server/microsandbox/sdk-form-schemas.js';
import {
	assertExecConfigForSdk,
	parseArgsJsonString,
	parseExecConfigJson
} from '$lib/server/microsandbox/json-validators.js';
import {
	sdkExec,
	sdkExecWithConfig,
	sdkShell,
	sdkStreamCollect,
	sdkStreamKill,
	sdkStreamOpen,
	sdkStreamRecv,
	sdkStreamSignal,
	sdkStreamStdinClose,
	sdkStreamStdinTake,
	sdkStreamStdinWrite,
	sdkStreamWait
} from '$lib/server/microsandbox/service.js';
import { assertSdkResult, redirectWithSdkOut } from '$lib/server/microsandbox/action-redirect.js';

const execForm = v.object({
	sandboxName: sandboxNameSchema,
	cmd: v.pipe(v.string(), v.nonEmpty()),
	argsJson: v.optional(v.string())
});

export const runExec = form(execForm, async ({ sandboxName, cmd, argsJson }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	let args: string[] = [];
	if (argsJson?.trim()) {
		try {
			args = parseArgsJsonString(argsJson);
		} catch (e) {
			invalid(e instanceof Error ? e.message : 'Invalid argsJson');
		}
	}
	const result = await sdkExec(routeName, cmd, args);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'exec', ...result.data });
});

export const runShell = form(
	v.object({
		sandboxName: sandboxNameSchema,
		script: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sandboxName, script }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkShell(routeName, script);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'shell', ...result.data });
	}
);

const execConfigForm = v.object({
	sandboxName: sandboxNameSchema,
	configJson: v.pipe(v.string(), v.nonEmpty())
});

export const runExecWithConfig = form(execConfigForm, async ({ sandboxName, configJson }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	let validated;
	try {
		validated = parseExecConfigJson(configJson);
	} catch (e) {
		invalid(e instanceof Error ? e.message : 'Invalid configJson');
	}
	const config = assertExecConfigForSdk(validated);
	const result = await sdkExecWithConfig(routeName, config);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'execWithConfig', ...result.data });
});

export const streamOpen = form(
	v.object({
		sandboxName: sandboxNameSchema,
		mode: v.picklist(['exec', 'shell'] as const),
		cmdOrScript: v.pipe(v.string(), v.nonEmpty()),
		argsJson: v.optional(v.string())
	}),
	async ({ sandboxName, mode, cmdOrScript, argsJson }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		let args: string[] | undefined;
		if (argsJson?.trim()) {
			try {
				args = parseArgsJsonString(argsJson);
			} catch (e) {
				invalid(e instanceof Error ? e.message : 'Invalid argsJson');
			}
		}
		const result = await sdkStreamOpen(routeName, mode, cmdOrScript, args);
		assertSdkResult(result);
		const { url } = getRequestEvent();
		const u = new URL(url.pathname + url.search, url.origin);
		u.searchParams.set('streamSession', result.data.sessionId);
		throw redirect(303, `${u.pathname}${u.search}`);
	}
);

export const streamRecv = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sessionId }) => {
		const result = await sdkStreamRecv(sessionId);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamRecv', ...result.data });
	}
);

export const streamWait = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sessionId }) => {
		const result = await sdkStreamWait(sessionId);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamWait', ...result.data });
	}
);

export const streamCollect = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sessionId }) => {
		const result = await sdkStreamCollect(sessionId);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamCollect', ...result.data });
	}
);

export const streamKill = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sessionId }) => {
		const result = await sdkStreamKill(sessionId);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamKill', done: true });
	}
);

export const streamSignal = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty()),
		signal: v.pipe(v.string(), v.transform(Number), v.number())
	}),
	async ({ sessionId, signal }) => {
		const result = await sdkStreamSignal(sessionId, signal);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamSignal', signal });
	}
);

export const streamStdinTake = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sessionId }) => {
		const result = await sdkStreamStdinTake(sessionId);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamStdinTake', ...result.data });
	}
);

export const streamStdinWrite = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty()),
		dataUtf8: v.string()
	}),
	async ({ sessionId, dataUtf8 }) => {
		const result = await sdkStreamStdinWrite(sessionId, dataUtf8);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamStdinWrite', bytes: dataUtf8.length });
	}
);

export const streamStdinClose = form(
	v.object({
		sessionId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sessionId }) => {
		const result = await sdkStreamStdinClose(sessionId);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'streamStdinClose', done: true });
	}
);
