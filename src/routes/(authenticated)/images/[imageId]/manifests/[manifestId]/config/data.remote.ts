import { getRequestEvent, query } from '$app/server';
import { and, eq } from 'drizzle-orm';
import { configTable, db, manifestTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getManifestConfig = query(async () => {
	const event = getRequestEvent();
	const imageId = parseIntParam(event.params.imageId, 'imageId');
	const manifestId = parseIntParam(event.params.manifestId, 'manifestId');

	const rows = await db
		.select({
			manifestId: manifestTable.id,
			manifestDigest: manifestTable.digest,
			configId: configTable.id,
			digest: configTable.digest,
			architecture: configTable.architecture,
			os: configTable.os,
			osVariant: configTable.osVariant,
			env: configTable.env,
			cmd: configTable.cmd,
			entrypoint: configTable.entrypoint,
			workingDir: configTable.workingDir,
			volumes: configTable.volumes,
			exposedPorts: configTable.exposedPorts,
			user: configTable.user,
			rootfsType: configTable.rootfsType,
			rootfsDiffIds: configTable.rootfsDiffIds,
			history: configTable.history,
			createdAt: configTable.createdAt
		})
		.from(manifestTable)
		.leftJoin(configTable, eq(configTable.manifestId, manifestTable.id))
		.where(and(eq(manifestTable.id, manifestId), eq(manifestTable.imageId, imageId)))
		.limit(1);

	return rows[0] ?? null;
});
