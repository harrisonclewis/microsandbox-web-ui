import { getRequestEvent, query } from '$app/server';
import { db, imageTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getImages = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'images',
		query: db.select({
			id: imageTable.id,
			reference: imageTable.reference,
			sizeBytes: imageTable.sizeBytes,
			lastUsedAt: imageTable.lastUsedAt,
			createdAt: imageTable.createdAt
		})
		.from(imageTable),
		sorts: {
			reference: imageTable.reference,
			sizeBytes: imageTable.sizeBytes,
			lastUsedAt: imageTable.lastUsedAt,
			createdAt: imageTable.createdAt
		},
		defaultSortBy: 'reference',
		defaultSortDir: 'asc',
		tieBreaker: imageTable.id
	});
});
