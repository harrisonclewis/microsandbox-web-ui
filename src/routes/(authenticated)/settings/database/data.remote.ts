import { query } from '$app/server';
import { count } from 'drizzle-orm';
import {
	configTable,
	db,
	imageTable,
	indexTable,
	layerTable,
	manifestLayerTable,
	manifestTable,
	runTable,
	sandboxImageTable,
	sandboxMetricTable,
	sandboxTable,
	snapshotTable,
	volumeTable
} from '$lib/server/db';

export const getDatabaseOverview = query(async () => {
	const countRows = await Promise.all([
		db.select({ value: count() }).from(imageTable),
		db.select({ value: count() }).from(indexTable),
		db.select({ value: count() }).from(manifestTable),
		db.select({ value: count() }).from(configTable),
		db.select({ value: count() }).from(layerTable),
		db.select({ value: count() }).from(manifestLayerTable),
		db.select({ value: count() }).from(sandboxTable),
		db.select({ value: count() }).from(runTable),
		db.select({ value: count() }).from(sandboxImageTable),
		db.select({ value: count() }).from(sandboxMetricTable),
		db.select({ value: count() }).from(snapshotTable),
		db.select({ value: count() }).from(volumeTable)
	]);

	return [
		{ table: 'image', rows: countRows[0][0]?.value ?? 0 },
		{ table: 'index', rows: countRows[1][0]?.value ?? 0 },
		{ table: 'manifest', rows: countRows[2][0]?.value ?? 0 },
		{ table: 'config', rows: countRows[3][0]?.value ?? 0 },
		{ table: 'layer', rows: countRows[4][0]?.value ?? 0 },
		{ table: 'manifest_layer', rows: countRows[5][0]?.value ?? 0 },
		{ table: 'sandbox', rows: countRows[6][0]?.value ?? 0 },
		{ table: 'run', rows: countRows[7][0]?.value ?? 0 },
		{ table: 'sandbox_image', rows: countRows[8][0]?.value ?? 0 },
		{ table: 'sandbox_metric', rows: countRows[9][0]?.value ?? 0 },
		{ table: 'snapshot', rows: countRows[10][0]?.value ?? 0 },
		{ table: 'volume', rows: countRows[11][0]?.value ?? 0 }
	];
});
