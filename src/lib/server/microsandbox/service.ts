import { Buffer } from 'node:buffer';
import { assertSdkUsable } from './guards.js';
import { toSandboxConfig } from './mappers.js';
import type { SandboxCreatePayload } from './sdk-form-schemas.js';
import { createExecSession, deleteExecSession, execEventToJson, exitStatusToJson, getExecSession } from './exec-sessions.js';
import type { ExecConfig, FsEntry, FsMetadata, NetworkConfig, PatchConfig, SandboxMetrics } from 'microsandbox';
import { sdkErr, sdkOk, type SdkResult } from './types.js';

function wrap<T>(fn: () => Promise<T>): Promise<SdkResult<T>> {
	return fn()
		.then((data) => sdkOk(data))
		.catch((e: unknown) => {
			const msg = e instanceof Error ? e.message : String(e);
			return sdkErr('SDK_ERROR', msg);
		});
}

async function getConnectedSandbox(name: string) {
	const gate = assertSdkUsable();
	if (!gate.ok) throw new Error(gate.message);
	const { msb } = gate;
	const handle = await msb.Sandbox.get(name);
	if (handle.status !== 'running') {
		const sb = await handle.start();
		return { msb, sb };
	}
	const sb = await handle.connect();
	return { msb, sb };
}

export async function sdkCreateSandbox(input: SandboxCreatePayload): Promise<SdkResult<{ name: string; ownsLifecycle: boolean; detached: boolean }>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const { msb } = gate;
		const config = toSandboxConfig(msb, input);
		const sb = input.detached ? await msb.Sandbox.createDetached(config) : await msb.Sandbox.create(config);
		const name = await sb.name;
		const ownsLifecycle = await sb.ownsLifecycle;
		return { name, ownsLifecycle, detached: !!input.detached };
	});
}

export async function sdkStartSandbox(name: string, detached: boolean): Promise<SdkResult<{ name: string }>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const { msb } = gate;
		const sb = detached ? await msb.Sandbox.startDetached(name) : await msb.Sandbox.start(name);
		return { name: await sb.name };
	});
}

export async function sdkStopSandbox(name: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const h = await gate.msb.Sandbox.get(name);
		await h.stop();
	});
}

export async function sdkStopAndWaitSandbox(name: string): Promise<SdkResult<{ code: number; success: boolean }>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		const status = await sb.stopAndWait();
		return exitStatusToJson(status);
	});
}

export async function sdkKillSandbox(name: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const h = await gate.msb.Sandbox.get(name);
		await h.kill();
	});
}

export async function sdkDrainSandbox(name: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.drain();
	});
}

export async function sdkWaitSandbox(name: string): Promise<SdkResult<{ code: number; success: boolean }>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		const status = await sb.wait();
		return exitStatusToJson(status);
	});
}

export async function sdkDetachSandbox(name: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.detach();
	});
}

export async function sdkRemoveStopped(name: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		await gate.msb.Sandbox.remove(name);
	});
}

export async function sdkRemovePersisted(name: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.removePersisted();
	});
}

export async function sdkGetHandle(name: string): Promise<
	SdkResult<{ name: string; status: string; configJson: string; createdAt: number | null; updatedAt: number | null }>
> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const h = await gate.msb.Sandbox.get(name);
		return {
			name: h.name,
			status: h.status,
			configJson: h.configJson,
			createdAt: h.createdAt,
			updatedAt: h.updatedAt
		};
	});
}

export async function sdkListSandboxes(): Promise<
	SdkResult<Array<{ name: string; status: string; configJson: string; createdAt?: number; updatedAt?: number }>>
> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const list = await gate.msb.Sandbox.list();
		return list.map((i) => ({
			name: i.name,
			status: i.status,
			configJson: i.configJson,
			createdAt: i.createdAt,
			updatedAt: i.updatedAt
		}));
	});
}

export async function sdkMetrics(name: string): Promise<SdkResult<SandboxMetrics>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		return sb.metrics();
	});
}

export async function sdkAllMetrics(): Promise<SdkResult<Record<string, SandboxMetrics>>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		return gate.msb.allSandboxMetrics();
	});
}

export async function sdkExec(name: string, cmd: string, args: string[]): Promise<SdkResult<{ code: number; success: boolean; stdout: string; stderr: string }>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		const out = await sb.exec(cmd, args);
		return {
			code: out.code,
			success: out.success,
			stdout: out.stdout(),
			stderr: out.stderr()
		};
	});
}

export async function sdkExecWithConfig(name: string, config: ExecConfig): Promise<SdkResult<{ code: number; success: boolean; stdout: string; stderr: string }>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		const out = await sb.execWithConfig(config);
		return {
			code: out.code,
			success: out.success,
			stdout: out.stdout(),
			stderr: out.stderr()
		};
	});
}

export async function sdkShell(name: string, script: string): Promise<SdkResult<{ code: number; success: boolean; stdout: string; stderr: string }>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		const out = await sb.shell(script);
		return {
			code: out.code,
			success: out.success,
			stdout: out.stdout(),
			stderr: out.stderr()
		};
	});
}

export async function sdkStreamOpen(
	name: string,
	mode: 'exec' | 'shell',
	cmdOrScript: string,
	args?: string[]
): Promise<SdkResult<{ sessionId: string }>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		const handle = mode === 'shell' ? await sb.shellStream(cmdOrScript) : await sb.execStream(cmdOrScript, args ?? []);
		const sessionId = createExecSession(name, handle);
		return { sessionId };
	});
}

export async function sdkStreamRecv(sessionId: string): Promise<SdkResult<{ event: ReturnType<typeof execEventToJson> | null }>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s) throw new Error('Stream session not found or expired');
		const ev = await s.handle.recv();
		return { event: ev ? execEventToJson(ev) : null };
	});
}

export async function sdkStreamWait(sessionId: string): Promise<SdkResult<{ code: number; success: boolean }>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s) throw new Error('Stream session not found or expired');
		const status = await s.handle.wait();
		deleteExecSession(sessionId);
		return exitStatusToJson(status);
	});
}

export async function sdkStreamCollect(sessionId: string): Promise<SdkResult<{ code: number; success: boolean; stdout: string; stderr: string }>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s) throw new Error('Stream session not found or expired');
		const out = await s.handle.collect();
		deleteExecSession(sessionId);
		return {
			code: out.code,
			success: out.success,
			stdout: out.stdout(),
			stderr: out.stderr()
		};
	});
}

export async function sdkStreamKill(sessionId: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s) throw new Error('Stream session not found or expired');
		await s.handle.kill();
		deleteExecSession(sessionId);
	});
}

export async function sdkStreamSignal(sessionId: string, signal: number): Promise<SdkResult<void>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s) throw new Error('Stream session not found or expired');
		await s.handle.signal(signal);
	});
}

export async function sdkStreamStdinTake(sessionId: string): Promise<SdkResult<{ ok: boolean }>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s) throw new Error('Stream session not found or expired');
		const sink = await s.handle.takeStdin();
		if (!sink) return { ok: false };
		s.sink = sink;
		s.stdinTaken = true;
		return { ok: true };
	});
}

export async function sdkStreamStdinWrite(sessionId: string, dataUtf8: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s?.sink) throw new Error('Stdin not taken for this session');
		await s.sink.write(Buffer.from(dataUtf8, 'utf8'));
	});
}

export async function sdkStreamStdinClose(sessionId: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const s = getExecSession(sessionId);
		if (!s?.sink) throw new Error('Stdin not taken for this session');
		await s.sink.close();
	});
}

/** FS ops — require running sandbox */
export async function sdkFsList(name: string, path: string): Promise<SdkResult<FsEntry[]>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		return sb.fs().list(path);
	});
}

export async function sdkFsStat(name: string, path: string): Promise<SdkResult<FsMetadata>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		return sb.fs().stat(path);
	});
}

export async function sdkFsExists(name: string, path: string): Promise<SdkResult<boolean>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		return sb.fs().exists(path);
	});
}

export async function sdkFsReadString(name: string, path: string): Promise<SdkResult<string>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		return sb.fs().readString(path);
	});
}

export async function sdkFsWrite(name: string, path: string, dataUtf8: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().write(path, Buffer.from(dataUtf8, 'utf8'));
	});
}

export async function sdkFsMkdir(name: string, path: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().mkdir(path);
	});
}

export async function sdkFsRename(name: string, from: string, to: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().rename(from, to);
	});
}

export async function sdkFsCopy(name: string, from: string, to: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().copy(from, to);
	});
}

export async function sdkFsRemove(name: string, path: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().remove(path);
	});
}

export async function sdkFsRemoveDir(name: string, path: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().removeDir(path);
	});
}

export async function sdkFsCopyFromHost(name: string, hostPath: string, guestPath: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().copyFromHost(hostPath, guestPath);
	});
}

export async function sdkFsCopyToHost(name: string, guestPath: string, hostPath: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { sb } = await getConnectedSandbox(name);
		await sb.fs().copyToHost(guestPath, hostPath);
	});
}

export async function sdkVolumeCreate(config: { name: string; quotaMib?: number; labels?: Record<string, string> }): Promise<SdkResult<{ name: string; path: string }>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const v = await gate.msb.Volume.create(config);
		return { name: v.name, path: v.path };
	});
}

export async function sdkVolumeRemove(volumeName: string): Promise<SdkResult<void>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		await gate.msb.Volume.remove(volumeName);
	});
}

export async function sdkVolumeList(): Promise<SdkResult<Array<{ name: string; quotaMib?: number; usedBytes: number; labels: Record<string, string>; createdAt?: number }>>> {
	return wrap(async () => {
		const gate = assertSdkUsable();
		if (!gate.ok) throw new Error(gate.message);
		const list = await gate.msb.Volume.list();
		return list.map((i) => ({
			name: i.name,
			quotaMib: i.quotaMib,
			usedBytes: i.usedBytes,
			labels: i.labels,
			createdAt: i.createdAt
		}));
	});
}

/** Download/install msb runtime (requires supported host + loadable native module). */
export async function sdkInstall(): Promise<SdkResult<void>> {
	return wrap(async () => {
		const { assertModuleLoaded } = await import('./guards.js');
		const mod = assertModuleLoaded();
		if (!mod.ok) throw new Error(mod.message);
		await mod.msb.install();
	});
}
