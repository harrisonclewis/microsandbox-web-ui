import { getRequestEvent, query } from '$app/server';
import { db, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getSandboxes = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'sandboxes',
		query: db.select({
			id: sandboxTable.id,
			name: sandboxTable.name,
			status: sandboxTable.status,
			createdAt: sandboxTable.createdAt,
			updatedAt: sandboxTable.updatedAt
		})
		.from(sandboxTable),
		sorts: {
			id: sandboxTable.id,
			name: sandboxTable.name,
			status: sandboxTable.status,
			createdAt: sandboxTable.createdAt,
			updatedAt: sandboxTable.updatedAt
		},
		defaultSortBy: 'name',
		defaultSortDir: 'asc',
		tieBreaker: sandboxTable.id
	});
});
