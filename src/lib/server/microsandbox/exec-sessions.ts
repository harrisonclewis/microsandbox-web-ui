import { randomBytes } from 'node:crypto';
import type { ExecHandle, ExecEvent, ExitStatus, ExecSink } from 'microsandbox';

export type StoredExecSession = {
	handle: ExecHandle;
	sandboxName: string;
	createdAt: number;
	stdinTaken: boolean;
	sink?: ExecSink;
};

const sessions = new Map<string, StoredExecSession>();

const TTL_MS = 60 * 60 * 1000; // 1 hour

function cleanupStale(): void {
	const now = Date.now();
	for (const [id, s] of sessions) {
		if (now - s.createdAt > TTL_MS) sessions.delete(id);
	}
}

export function createExecSession(sandboxName: string, handle: ExecHandle): string {
	cleanupStale();
	const id = randomBytes(16).toString('hex');
	sessions.set(id, { handle, sandboxName, createdAt: Date.now(), stdinTaken: false });
	return id;
}

export function getExecSession(id: string): StoredExecSession | undefined {
	cleanupStale();
	return sessions.get(id);
}

export function deleteExecSession(id: string): void {
	sessions.delete(id);
}

export function execEventToJson(ev: ExecEvent): {
	eventType: string;
	pid?: number;
	data?: string;
	code?: number;
} {
	return {
		eventType: ev.eventType,
		...(ev.pid != null ? { pid: ev.pid } : {}),
		...(ev.data != null ? { data: ev.data.toString('utf8') } : {}),
		...(ev.code != null ? { code: ev.code } : {})
	};
}

export function exitStatusToJson(s: ExitStatus): { code: number; success: boolean } {
	return { code: s.code, success: s.success };
}
