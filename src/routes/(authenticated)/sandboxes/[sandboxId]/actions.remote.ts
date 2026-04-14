import { form } from '$app/server';
import * as v from 'valibot';
import { assertSandboxNameMatches, getSandboxNameFromRouteParam } from '$lib/server/sandbox-route';
import { sandboxNameSchema } from '$lib/server/microsandbox/sdk-form-schemas.js';
import {
	sdkDetachSandbox,
	sdkDrainSandbox,
	sdkKillSandbox,
	sdkRemovePersisted,
	sdkRemoveStopped,
	sdkStartSandbox,
	sdkStopAndWaitSandbox,
	sdkStopSandbox,
	sdkWaitSandbox
} from '$lib/server/microsandbox/service.js';
import { assertSdkResult, redirectWithNotice } from '$lib/server/microsandbox/action-redirect.js';

const withName = v.object({
	sandboxName: sandboxNameSchema
});

export const startSandboxAttached = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkStartSandbox(routeName, false);
	assertSdkResult(result);
	redirectWithNotice('Sandbox start (attached) completed.');
});

export const startSandboxDetached = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkStartSandbox(routeName, true);
	assertSdkResult(result);
	redirectWithNotice('Sandbox start (detached) completed.');
});

export const stopSandbox = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkStopSandbox(routeName);
	assertSdkResult(result);
	redirectWithNotice('Stop signal sent.');
});

export const stopAndWaitSandbox = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkStopAndWaitSandbox(routeName);
	assertSdkResult(result);
	redirectWithNotice(`Stopped (exit ${result.data.code}, success=${result.data.success}).`);
});

export const killSandbox = form(
	v.object({
		sandboxName: sandboxNameSchema,
		confirm: v.literal('KILL')
	}),
	async ({ sandboxName }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkKillSandbox(routeName);
		assertSdkResult(result);
		redirectWithNotice('Sandbox killed.');
	}
);

export const drainSandbox = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkDrainSandbox(routeName);
	assertSdkResult(result);
	redirectWithNotice('Drain requested.');
});

export const waitSandbox = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkWaitSandbox(routeName);
	assertSdkResult(result);
	redirectWithNotice(`Wait completed (exit ${result.data.code}).`);
});

export const detachSandbox = form(withName, async ({ sandboxName }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkDetachSandbox(routeName);
	assertSdkResult(result);
	redirectWithNotice('Detached from sandbox.');
});

export const removeStoppedSandbox = form(
	v.object({
		sandboxName: sandboxNameSchema,
		confirm: v.literal('REMOVE_STOPPED')
	}),
	async ({ sandboxName }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkRemoveStopped(routeName);
		assertSdkResult(result);
		redirectWithNotice('Stopped sandbox removed from SDK store.');
	}
);

export const removePersistedSandbox = form(
	v.object({
		sandboxName: sandboxNameSchema,
		confirm: v.literal('REMOVE_PERSISTED')
	}),
	async ({ sandboxName }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkRemovePersisted(routeName);
		assertSdkResult(result);
		redirectWithNotice('Persisted sandbox state removed.');
	}
);
