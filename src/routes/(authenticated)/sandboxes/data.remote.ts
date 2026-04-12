import { getRequestEvent, query } from '$app/server';
import { db, sandboxTable } from '$lib/server/db';
import type { Sandbox } from '$lib/server/db/schema';
import { Pagination, type PaginatedResult } from '$lib/server/pagination';

type SandboxListRow = Pick<Sandbox, 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'>;

export const getSandboxes = query<PaginatedResult<SandboxListRow>>(async () => {
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
