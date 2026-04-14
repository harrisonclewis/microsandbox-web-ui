import { form } from '$app/server';
import * as v from 'valibot';
import { assertSandboxNameMatches, getSandboxNameFromRouteParam } from '$lib/server/sandbox-route';
import { sandboxNameSchema } from '$lib/server/microsandbox/sdk-form-schemas.js';
import {
	sdkFsCopy,
	sdkFsCopyFromHost,
	sdkFsCopyToHost,
	sdkFsExists,
	sdkFsList,
	sdkFsMkdir,
	sdkFsReadString,
	sdkFsRemove,
	sdkFsRemoveDir,
	sdkFsRename,
	sdkFsStat,
	sdkFsWrite
} from '$lib/server/microsandbox/service.js';
import { assertSdkResult, redirectWithSdkOut } from '$lib/server/microsandbox/action-redirect.js';

const pathForm = v.object({
	sandboxName: sandboxNameSchema,
	path: v.pipe(v.string(), v.nonEmpty())
});

export const fsList = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsList(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.list', path, entries: result.data });
});

export const fsStat = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsStat(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.stat', path, meta: result.data });
});

export const fsExists = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsExists(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.exists', path, exists: result.data });
});

export const fsReadText = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsReadString(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.readString', path, content: result.data });
});

export const fsWrite = form(
	v.object({
		sandboxName: sandboxNameSchema,
		path: v.pipe(v.string(), v.nonEmpty()),
		content: v.string()
	}),
	async ({ sandboxName, path, content }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkFsWrite(routeName, path, content);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'fs.write', path, bytes: content.length });
	}
);

export const fsMkdir = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsMkdir(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.mkdir', path });
});

export const fsRename = form(
	v.object({
		sandboxName: sandboxNameSchema,
		from: v.pipe(v.string(), v.nonEmpty()),
		to: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sandboxName, from, to }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkFsRename(routeName, from, to);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'fs.rename', from, to });
	}
);

export const fsCopy = form(
	v.object({
		sandboxName: sandboxNameSchema,
		from: v.pipe(v.string(), v.nonEmpty()),
		to: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sandboxName, from, to }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkFsCopy(routeName, from, to);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'fs.copy', from, to });
	}
);

export const fsRemove = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsRemove(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.remove', path });
});

export const fsRemoveDir = form(pathForm, async ({ sandboxName, path }) => {
	const routeName = await getSandboxNameFromRouteParam();
	assertSandboxNameMatches(sandboxName, routeName);
	const result = await sdkFsRemoveDir(routeName, path);
	assertSdkResult(result);
	redirectWithSdkOut({ kind: 'fs.removeDir', path });
});

export const fsCopyFromHost = form(
	v.object({
		sandboxName: sandboxNameSchema,
		hostPath: v.pipe(v.string(), v.nonEmpty()),
		guestPath: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sandboxName, hostPath, guestPath }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkFsCopyFromHost(routeName, hostPath, guestPath);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'fs.copyFromHost', hostPath, guestPath });
	}
);

export const fsCopyToHost = form(
	v.object({
		sandboxName: sandboxNameSchema,
		guestPath: v.pipe(v.string(), v.nonEmpty()),
		hostPath: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ sandboxName, guestPath, hostPath }) => {
		const routeName = await getSandboxNameFromRouteParam();
		assertSandboxNameMatches(sandboxName, routeName);
		const result = await sdkFsCopyToHost(routeName, guestPath, hostPath);
		assertSdkResult(result);
		redirectWithSdkOut({ kind: 'fs.copyToHost', guestPath, hostPath });
	}
);
