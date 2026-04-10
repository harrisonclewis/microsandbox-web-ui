<script lang="ts">
	import { page } from '$app/state';
import type { SortDirection } from '$lib/pagination/queryParams';

	let {
		namespace,
		sortKey,
		label,
		currentSortBy,
		currentSortDir
	}: {
		namespace: string;
		sortKey: string;
		label: string;
		currentSortBy: string;
		currentSortDir: SortDirection;
	} = $props();

	const isActive = $derived(currentSortBy === sortKey);
	const nextSortDir = $derived.by((): SortDirection =>
		isActive && currentSortDir === 'asc' ? 'desc' : 'asc'
	);

	function hrefForSort(): string {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(`${namespace}SortBy`, sortKey);
		params.set(`${namespace}SortDir`, nextSortDir);
		params.set(`${namespace}Page`, '1');
		return `${page.url.pathname}?${params.toString()}`;
	}
</script>

<th>
	<a href={hrefForSort()}>
		{label}
		{#if isActive}
			{currentSortDir === 'asc' ? ' ▲' : ' ▼'}
		{/if}
	</a>
</th>
