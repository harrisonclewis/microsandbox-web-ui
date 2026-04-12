<script lang="ts">
	import { goto } from '$app/navigation';
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

	type DataTablePagination<TData = Record<string, unknown>> = {
		data: TData[];
		sortBy: string;
		sortDir: SortDirection;
		defaultSortBy: string;
		defaultSortDir: SortDirection;
		page: number;
		totalPages: number;
	};

	type DataTableRemotePagination<TData = Record<string, unknown>> = {
		current?: DataTablePagination<TData>;
		refresh?: () => Promise<unknown> | unknown;
		error?: unknown;
		loading?: boolean;
	};

	type DataTableRemoteLabels = {
		error?: string;
		loading?: string;
		noPayload?: string;
		empty?: string;
	};

	const defaultRemoteLabels: Required<DataTableRemoteLabels> = {
		error: 'Unable to load data.',
		loading: 'Loading…',
		noPayload: 'No data returned.',
		empty: 'No rows found.'
	};

	let {
		namespace,
		data,
		pagination,
		remotePagination,
		remoteState = true,
		remoteLabels,
		columns,
		currentSortBy,
		currentSortDir,
		defaultSortBy,
		defaultSortDir,
		currentPage,
		totalPages
	}: {
		namespace: string;
		data?: Record<string, unknown>[];
		pagination?: DataTablePagination;
		remotePagination?: DataTableRemotePagination;
		remoteState?: boolean;
		remoteLabels?: DataTableRemoteLabels;
		columns: DataTableColumn[];
		currentSortBy?: string;
		currentSortDir?: SortDirection;
		defaultSortBy?: string;
		defaultSortDir?: SortDirection;
		currentPage?: number;
		totalPages?: number;
	} = $props();

	const effectiveRemoteLabels = $derived({
		error: remoteLabels?.error ?? defaultRemoteLabels.error,
		loading: remoteLabels?.loading ?? defaultRemoteLabels.loading,
		noPayload: remoteLabels?.noPayload ?? defaultRemoteLabels.noPayload,
		empty: remoteLabels?.empty ?? defaultRemoteLabels.empty
	});

	const useRemoteShell = $derived(remoteState && !!remotePagination);

	const remoteCurrent = $derived(remotePagination?.current);
	const effectiveData = $derived(data ?? pagination?.data ?? remoteCurrent?.data ?? []);
	const effectiveDefaultSortDir = $derived(
		defaultSortDir ?? pagination?.defaultSortDir ?? remoteCurrent?.defaultSortDir ?? 'asc'
	);
	const effectiveDefaultSortBy = $derived(
		defaultSortBy ??
			pagination?.defaultSortBy ??
			remoteCurrent?.defaultSortBy ??
			pagination?.sortBy ??
			remoteCurrent?.sortBy ??
			currentSortBy ??
			''
	);
	const effectiveCurrentSortBy = $derived(
		currentSortBy ?? pagination?.sortBy ?? remoteCurrent?.sortBy ?? effectiveDefaultSortBy
	);
	const effectiveCurrentSortDir = $derived(
		currentSortDir ?? pagination?.sortDir ?? remoteCurrent?.sortDir ?? effectiveDefaultSortDir
	);
	const effectiveCurrentPage = $derived(currentPage ?? pagination?.page ?? remoteCurrent?.page ?? 1);
	const effectiveTotalPages = $derived(
		totalPages ?? pagination?.totalPages ?? remoteCurrent?.totalPages ?? 1
	);
	const safeCurrentPage = $derived(Math.max(1, Math.min(effectiveCurrentPage, effectiveTotalPages)));
	const prevPage = $derived(Math.max(1, safeCurrentPage - 1));
	const nextPage = $derived(Math.min(effectiveTotalPages, safeCurrentPage + 1));
	const startPage = $derived(Math.max(1, safeCurrentPage - 2));
	const endPage = $derived(Math.min(effectiveTotalPages, safeCurrentPage + 2));
	const sortableColumnKeys = $derived(
		columns.filter((column) => column.sortable).map((column) => column.key)
	);
	const activeSort = $derived.by(() => {
		const sortParam = getSortParamName(namespace);
		const parsedSort = parseSortToken(page.url.searchParams.get(sortParam));
		if (parsedSort && sortableColumnKeys.includes(parsedSort.sortBy)) {
			return parsedSort;
		}

		return { sortBy: effectiveCurrentSortBy, sortDir: effectiveCurrentSortDir };
	});
	const pageLinks = $derived(
		Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx)
	);

	function buildHref(params: URLSearchParams): string {
		const query = params.toString();
		return query ? `${page.url.pathname}?${query}` : page.url.pathname;
	}

	function isRemoteNavigation(event: MouseEvent): boolean {
		if (!remotePagination) return false;
		if (event.defaultPrevented) return false;
		if (event.button !== 0) return false;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
		return true;
	}

	async function handleRemoteNavigation(event: MouseEvent, href: string): Promise<void> {
		if (!isRemoteNavigation(event)) return;
		event.preventDefault();
		await goto(href, { keepFocus: true, noScroll: true });
		await remotePagination?.refresh?.();
	}

	function hrefForSort(sortKey: string): string {
		const params = new URLSearchParams(page.url.searchParams);
		const sortParam = getSortParamName(namespace);
		const pageParam = getPageParamName(namespace);
		const nextSortDir: SortDirection =
			activeSort.sortBy === sortKey && activeSort.sortDir === 'asc' ? 'desc' : 'asc';

		if (isDefaultSort(sortKey, nextSortDir, effectiveDefaultSortBy, effectiveDefaultSortDir)) {
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

		if (
			isDefaultSort(
				activeSort.sortBy,
				activeSort.sortDir,
				effectiveDefaultSortBy,
				effectiveDefaultSortDir
			)
		) {
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

{#snippet tableBlock()}
	<table>
		<thead>
			<tr>
				{#each columns as column}
					<th>
						{#if column.sortable}
							<a
								href={hrefForSort(column.key)}
								data-sveltekit-reload={remotePagination ? undefined : true}
								onclick={(event) => handleRemoteNavigation(event, hrefForSort(column.key))}
							>
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
			{#each effectiveData as row}
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

	{#if effectiveTotalPages > 1}
		<nav aria-label={`${namespace} pagination`}>
			<a
				href={hrefForPage(1)}
				aria-disabled={safeCurrentPage === 1}
				data-sveltekit-reload={remotePagination ? undefined : true}
				onclick={(event) => handleRemoteNavigation(event, hrefForPage(1))}>First</a
			>
			<a
				href={hrefForPage(prevPage)}
				aria-disabled={safeCurrentPage === 1}
				data-sveltekit-reload={remotePagination ? undefined : true}
				onclick={(event) => handleRemoteNavigation(event, hrefForPage(prevPage))}>Prev</a
			>
			{#each pageLinks as pageNumber}
				<a
					href={hrefForPage(pageNumber)}
					aria-current={pageNumber === safeCurrentPage ? 'page' : undefined}
					data-sveltekit-reload={remotePagination ? undefined : true}
					onclick={(event) => handleRemoteNavigation(event, hrefForPage(pageNumber))}
				>
					{pageNumber}
				</a>
			{/each}
			<a
				href={hrefForPage(nextPage)}
				aria-disabled={safeCurrentPage === effectiveTotalPages}
				data-sveltekit-reload={remotePagination ? undefined : true}
				onclick={(event) => handleRemoteNavigation(event, hrefForPage(nextPage))}
				>Next</a
			>
			<a
				href={hrefForPage(effectiveTotalPages)}
				aria-disabled={safeCurrentPage === effectiveTotalPages}
				data-sveltekit-reload={remotePagination ? undefined : true}
				onclick={(event) => handleRemoteNavigation(event, hrefForPage(effectiveTotalPages))}
				>Last</a
			>
		</nav>
	{/if}
{/snippet}

{#if useRemoteShell && remotePagination}
	{#if remotePagination.error}
		<p>{effectiveRemoteLabels.error}</p>
	{:else if remotePagination.loading}
		<p>{effectiveRemoteLabels.loading}</p>
	{:else if !remotePagination.current}
		<p>{effectiveRemoteLabels.noPayload}</p>
	{:else if remotePagination.current.data.length === 0}
		<p>{effectiveRemoteLabels.empty}</p>
	{:else}
		{@render tableBlock()}
	{/if}
{:else}
	{@render tableBlock()}
{/if}
