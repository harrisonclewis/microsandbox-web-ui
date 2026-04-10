import { getRequestEvent, query } from '$app/server';
import { db, layerTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getLayers = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'layers',
		query: db.select({
			id: layerTable.id,
			digest: layerTable.digest,
			diffId: layerTable.diffId,
			mediaType: layerTable.mediaType,
			sizeBytes: layerTable.sizeBytes,
			createdAt: layerTable.createdAt
		})
		.from(layerTable),
		sorts: {
			id: layerTable.id,
			digest: layerTable.digest,
			diffId: layerTable.diffId,
			mediaType: layerTable.mediaType,
			sizeBytes: layerTable.sizeBytes,
			createdAt: layerTable.createdAt
		},
		defaultSortBy: 'id',
		defaultSortDir: 'asc',
		tieBreaker: layerTable.id
	});
});
