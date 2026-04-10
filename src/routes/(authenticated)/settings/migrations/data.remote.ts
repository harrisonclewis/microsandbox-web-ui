import { query } from '$app/server';
import { desc } from 'drizzle-orm';
import { db, seaqlMigrationsTable } from '$lib/server/db';

export const getMigrations = query(async () => {
	return db
		.select({
			version: seaqlMigrationsTable.version,
			appliedAt: seaqlMigrationsTable.appliedAt
		})
		.from(seaqlMigrationsTable)
		.orderBy(desc(seaqlMigrationsTable.appliedAt), desc(seaqlMigrationsTable.version));
});
