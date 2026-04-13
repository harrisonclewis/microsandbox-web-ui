import { getRequestEvent, query } from '$app/server';
import { sandboxEngineConfigSchema, type SandboxEngineConfig } from '$lib/sandbox/engine-config';
import { db, sandboxTable } from '$lib/server/db';
import type { Sandbox } from '$lib/server/db/schema';
import { Pagination, type PaginatedResult } from '$lib/server/pagination';
import { DbJson, type DbJsonColumn } from '$lib/validation/db-json';

export const getSandboxes = query<PaginatedResult<Sandbox>>(async () => {
	const event = getRequestEvent();
	const page = await Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'sandboxes',
		query: db
			.select({
				id: sandboxTable.id,
				name: sandboxTable.name,
				status: sandboxTable.status,
				createdAt: sandboxTable.createdAt,
				updatedAt: sandboxTable.updatedAt,
				config: sandboxTable.config
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

	return {
		...page,
		data: page.data.map(sandbox => ({
			...sandbox,
			config: DbJson.column(sandboxEngineConfigSchema, sandbox.config)
		}))
	};
});
