<script lang="ts">
	import { page } from '$app/state';
	import {
		encodeSortToken,
		getPageParamName,
		getSortParamName,
		isDefaultSort,
		parseSortToken,
		type SortDirection
	} from '$lib/pagination/queryParams';

	type DataTableColumn<TData = Record<string, unknown>> = {
		key: string;
		label: string;
		sortable?: boolean;
		type?: string;
		value?: (row: TData) => unknown;
		href?: (row: TData) => string;
		text?: (row: TData) => string;
		empty?: string;
	};

	let {
		namespace,
		data,
		columns,
		currentSortBy,
		currentSortDir,
		defaultSortBy,
		defaultSortDir = 'asc',
		currentPage,
		totalPages
	}: {
		namespace: string;
		data: Record<string, unknown>[];
		columns: DataTableColumn[];
		currentSortBy: string;
		currentSortDir: SortDirection;
		defaultSortBy: string;
		defaultSortDir?: SortDirection;
		currentPage: number;
		totalPages: number;
	} = $props();

	const safeCurrentPage = $derived(Math.max(1, Math.min(currentPage, totalPages)));
	const prevPage = $derived(Math.max(1, safeCurrentPage - 1));
	const nextPage = $derived(Math.min(totalPages, safeCurrentPage + 1));
	const startPage = $derived(Math.max(1, safeCurrentPage - 2));
	const endPage = $derived(Math.min(totalPages, safeCurrentPage + 2));
	const sortableColumnKeys = $derived(
		columns.filter((column) => column.sortable).map((column) => column.key)
	);
	const activeSort = $derived.by(() => {
		const sortParam = getSortParamName(namespace);
		const parsedSort = parseSortToken(page.url.searchParams.get(sortParam));
		if (parsedSort && sortableColumnKeys.includes(parsedSort.sortBy)) {
			return parsedSort;
		}

		return { sortBy: currentSortBy, sortDir: currentSortDir };
	});
	const pageLinks = $derived(
		Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx)
	);

	function buildHref(params: URLSearchParams): string {
		const query = params.toString();
		return query ? `${page.url.pathname}?${query}` : page.url.pathname;
	}

	function hrefForSort(sortKey: string): string {
		const params = new URLSearchParams(page.url.searchParams);
		const sortParam = getSortParamName(namespace);
		const pageParam = getPageParamName(namespace);
		const nextSortDir: SortDirection =
			activeSort.sortBy === sortKey && activeSort.sortDir === 'asc' ? 'desc' : 'asc';

		if (isDefaultSort(sortKey, nextSortDir, defaultSortBy, defaultSortDir)) {
			params.delete(sortParam);
		} else {
			params.set(sortParam, encodeSortToken(sortKey, nextSortDir));
		}

		params.delete(pageParam);
		return buildHref(params);
	}

	function hrefForPage(targetPage: number): string {
		const params = new URLSearchParams(page.url.searchParams);
		const sortParam = getSortParamName(namespace);
		const pageParam = getPageParamName(namespace);

		if (targetPage <= 1) {
			params.delete(pageParam);
		} else {
			params.set(pageParam, String(targetPage));
		}

		if (isDefaultSort(activeSort.sortBy, activeSort.sortDir, defaultSortBy, defaultSortDir)) {
			params.delete(sortParam);
		} else {
			params.set(sortParam, encodeSortToken(activeSort.sortBy, activeSort.sortDir));
		}

		return buildHref(params);
	}

	function getColumnValue(column: DataTableColumn, row: Record<string, unknown>): unknown {
		if (column.value) {
			return column.value(row);
		}

		return row[column.key];
	}

	function stringifyValue(value: unknown, emptyFallback = 'n/a'): string {
		if (value === null || value === undefined || value === '') {
			return emptyFallback;
		}

		if (typeof value === 'object') {
			return JSON.stringify(value);
		}

		return String(value);
	}
</script>

<table>
	<thead>
		<tr>
			{#each columns as column}
				<th>
					{#if column.sortable}
						<a href={hrefForSort(column.key)} data-sveltekit-reload>
							{column.label}
							{#if activeSort.sortBy === column.key}
								{activeSort.sortDir === 'asc' ? ' ▲' : ' ▼'}
							{/if}
						</a>
					{:else}
						{column.label}
					{/if}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each data as row}
			<tr>
				{#each columns as column}
					<td>
						{#if column.type === 'link' && column.href}
							<a href={column.href(row)}>
								{column.text
									? column.text(row)
									: stringifyValue(getColumnValue(column, row), column.empty ?? 'n/a')}
							</a>
						{:else}
							{stringifyValue(getColumnValue(column, row), column.empty ?? 'n/a')}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

{#if totalPages > 1}
	<nav aria-label={`${namespace} pagination`}>
		<a href={hrefForPage(1)} aria-disabled={safeCurrentPage === 1} data-sveltekit-reload>First</a>
		<a href={hrefForPage(prevPage)} aria-disabled={safeCurrentPage === 1} data-sveltekit-reload>Prev</a>
		{#each pageLinks as pageNumber}
			<a
				href={hrefForPage(pageNumber)}
				aria-current={pageNumber === safeCurrentPage ? 'page' : undefined}
				data-sveltekit-reload
			>
				{pageNumber}
			</a>
		{/each}
		<a href={hrefForPage(nextPage)} aria-disabled={safeCurrentPage === totalPages} data-sveltekit-reload
			>Next</a
		>
		<a href={hrefForPage(totalPages)} aria-disabled={safeCurrentPage === totalPages} data-sveltekit-reload
			>Last</a
		>
	</nav>
{/if}
