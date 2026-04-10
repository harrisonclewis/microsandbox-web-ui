import { getRequestEvent, query } from '$app/server';
import { db, seaqlMigrationsTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getMigrations = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'migrations',
		query: db.select({
			version: seaqlMigrationsTable.version,
			appliedAt: seaqlMigrationsTable.appliedAt
		})
		.from(seaqlMigrationsTable),
		sorts: {
			version: seaqlMigrationsTable.version,
			appliedAt: seaqlMigrationsTable.appliedAt
		},
		defaultSortBy: 'appliedAt',
		defaultSortDir: 'desc',
		tieBreaker: seaqlMigrationsTable.version
	});
});
