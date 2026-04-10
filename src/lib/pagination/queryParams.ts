export type SortDirection = 'asc' | 'desc';

export function getPageParamName(namespace: string): string {
	return `${namespace}[page]`;
}

export function getSortParamName(namespace: string): string {
	return `${namespace}[sort]`;
}

export function encodeSortToken(sortBy: string, sortDir: SortDirection): string {
	return `${sortDir === 'asc' ? '+' : '-'}${sortBy}`;
}

export function parseSortToken(value: string | null): { sortBy: string; sortDir: SortDirection } | null {
	if (!value || value.length < 2) {
		return null;
	}

	const directionToken = value[0];
	if (directionToken !== '+' && directionToken !== '-') {
		return null;
	}

	const sortBy = value.slice(1).trim();
	if (!sortBy) {
		return null;
	}

	return {
		sortBy,
		sortDir: directionToken === '+' ? 'asc' : 'desc'
	};
}

export function isDefaultSort(
	sortBy: string,
	sortDir: SortDirection,
	defaultSortBy: string,
	defaultSortDir: SortDirection
): boolean {
	return sortBy === defaultSortBy && sortDir === defaultSortDir;
}
