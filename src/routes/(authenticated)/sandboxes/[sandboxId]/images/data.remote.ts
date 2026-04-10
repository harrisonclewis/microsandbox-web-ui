import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, imageTable, sandboxImageTable, sandboxTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxImages = query(async () => {
	const sandboxId = parseIntParam(getRequestEvent().params.sandboxId, 'sandboxId');

	const [sandboxRows, images] = await Promise.all([
		db
			.select({
				id: sandboxTable.id,
				name: sandboxTable.name,
				status: sandboxTable.status
			})
			.from(sandboxTable)
			.where(eq(sandboxTable.id, sandboxId))
			.limit(1),
		db
			.select({
				id: sandboxImageTable.id,
				imageId: imageTable.id,
				imageReference: imageTable.reference,
				manifestDigest: sandboxImageTable.manifestDigest,
				createdAt: sandboxImageTable.createdAt
			})
			.from(sandboxImageTable)
			.innerJoin(imageTable, eq(imageTable.id, sandboxImageTable.imageId))
			.where(eq(sandboxImageTable.sandboxId, sandboxId))
			.orderBy(desc(sandboxImageTable.createdAt), desc(sandboxImageTable.id))
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		images
	};
});
