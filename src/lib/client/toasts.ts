import { writable } from "svelte/store";

export enum ToastType {
	Success = "success",
	Error = "error",
	Warning = "warning",
	Info = "info",
}

export type Toast = {
	id: string;
	type: ToastType;
	message: string;
};

export const toasts = writable<Toast[]>([]);

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const TOAST_DURATION = 5000;

export function toast(input: Omit<Toast, "id">): void {
	const id = crypto.randomUUID();
	const entry: Toast = { id, ...input };

	toasts.update((list) => [...list, entry]);

	const timer = setTimeout(() => {
		timers.delete(id);
		removeById(id);
	}, TOAST_DURATION);
	
    timers.set(id, timer);
}

export function clearToast(entry: Toast): void {
	const timer = timers.get(entry.id);
	
    if (timer !== undefined) {
		clearTimeout(timer);
		timers.delete(entry.id);
	}

	removeById(entry.id);
}

function removeById(id: string): void {
	toasts.update((list) => {
		const index = list.findIndex((t) => t.id === id);
		if (index === -1) {
			return list;
		}
		const next = list.slice();
		next.splice(index, 1);
		return next;
	});
}
