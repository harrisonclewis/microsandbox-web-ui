<script lang="ts">
	import { page } from '$app/state';

	let { namespace, currentPage, totalPages }: { namespace: string; currentPage: number; totalPages: number } =
		$props();

	function hrefFor(targetPage: number): string {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(`${namespace}Page`, String(targetPage));
		return `${page.url.pathname}?${params.toString()}`;
	}

	const safeCurrentPage = $derived(Math.max(1, Math.min(currentPage, totalPages)));
	const prevPage = $derived(Math.max(1, safeCurrentPage - 1));
	const nextPage = $derived(Math.min(totalPages, safeCurrentPage + 1));
	const startPage = $derived(Math.max(1, safeCurrentPage - 2));
	const endPage = $derived(Math.min(totalPages, safeCurrentPage + 2));
	const pageLinks = $derived(
		Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx)
	);
</script>

{#if totalPages > 1}
	<nav aria-label={`${namespace} pagination`}>
		<a href={hrefFor(1)} aria-disabled={safeCurrentPage === 1}>First</a>
		<a href={hrefFor(prevPage)} aria-disabled={safeCurrentPage === 1}>Prev</a>
		{#each pageLinks as pageNumber}
			<a href={hrefFor(pageNumber)} aria-current={pageNumber === safeCurrentPage ? 'page' : undefined}>
				{pageNumber}
			</a>
		{/each}
		<a href={hrefFor(nextPage)} aria-disabled={safeCurrentPage === totalPages}>Next</a>
		<a href={hrefFor(totalPages)} aria-disabled={safeCurrentPage === totalPages}>Last</a>
	</nav>
{/if}
