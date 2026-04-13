// place files you want to import through the `$lib` alias in this folder.

/**
 * Format a byte count using binary steps (1024): B, KB, MB, GB, TB.
 * Same idea as `formatBytes` in legacy sandboxes — picks the nearest sensible unit.
 */
export function convertBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return '—';
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function formatMib(mib: number): string {
	mib = mib * 1024 * 1024;
	return convertBytes(mib);
}

/** @alias convertBytes */
export const formatBytes = convertBytes;
