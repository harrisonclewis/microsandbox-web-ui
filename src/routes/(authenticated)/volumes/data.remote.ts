import { getRequestEvent, query } from '$app/server';
import { db, volumeTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getVolumes = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'volumes',
		query: db.select({
			id: volumeTable.id,
			name: volumeTable.name,
			quotaMib: volumeTable.quotaMib,
			sizeBytes: volumeTable.sizeBytes,
			labels: volumeTable.labels,
			createdAt: volumeTable.createdAt,
			updatedAt: volumeTable.updatedAt
		})
		.from(volumeTable),
		sorts: {
			name: volumeTable.name,
			quotaMib: volumeTable.quotaMib,
			sizeBytes: volumeTable.sizeBytes,
			updatedAt: volumeTable.updatedAt
		},
		defaultSortBy: 'name',
		defaultSortDir: 'asc',
		tieBreaker: volumeTable.id
	});
});
