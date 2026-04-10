import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const imageTable = sqliteTable('image', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	reference: text('reference').notNull().unique(),
	sizeBytes: integer('size_bytes'),
	lastUsedAt: text('last_used_at'),
	createdAt: text('created_at')
});

export const indexTable = sqliteTable('index', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	imageId: integer('image_id')
		.notNull()
		.references(() => imageTable.id, { onDelete: 'cascade' }),
	schemaVersion: integer('schema_version'),
	mediaType: text('media_type'),
	platformOs: text('platform_os'),
	platformArch: text('platform_arch'),
	platformVariant: text('platform_variant'),
	annotations: text('annotations'),
	createdAt: text('created_at')
});

export const manifestTable = sqliteTable('manifest', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	imageId: integer('image_id')
		.notNull()
		.references(() => imageTable.id, { onDelete: 'cascade' }),
	indexId: integer('index_id').references(() => indexTable.id, { onDelete: 'set null' }),
	digest: text('digest').notNull().unique(),
	schemaVersion: integer('schema_version'),
	mediaType: text('media_type'),
	annotations: text('annotations'),
	createdAt: text('created_at')
});

export const configTable = sqliteTable('config', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	manifestId: integer('manifest_id')
		.notNull()
		.references(() => manifestTable.id, { onDelete: 'cascade' })
		.unique(),
	digest: text('digest').notNull(),
	architecture: text('architecture'),
	os: text('os'),
	osVariant: text('os_variant'),
	env: text('env'),
	cmd: text('cmd'),
	entrypoint: text('entrypoint'),
	workingDir: text('working_dir'),
	volumes: text('volumes'),
	exposedPorts: text('exposed_ports'),
	user: text('user'),
	rootfsType: text('rootfs_type'),
	rootfsDiffIds: text('rootfs_diff_ids'),
	history: text('history'),
	createdAt: text('created_at')
});

export const layerTable = sqliteTable('layer', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	digest: text('digest').notNull().unique(),
	diffId: text('diff_id').notNull(),
	mediaType: text('media_type'),
	sizeBytes: integer('size_bytes'),
	createdAt: text('created_at')
});

export const manifestLayerTable = sqliteTable('manifest_layer', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	manifestId: integer('manifest_id')
		.notNull()
		.references(() => manifestTable.id, { onDelete: 'cascade' }),
	layerId: integer('layer_id')
		.notNull()
		.references(() => layerTable.id, { onDelete: 'cascade' }),
	position: integer('position').notNull()
});

export const sandboxTable = sqliteTable('sandbox', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	config: text('config').notNull(),
	status: text('status').notNull(),
	createdAt: text('created_at'),
	updatedAt: text('updated_at')
});

export const runTable = sqliteTable('run', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sandboxId: integer('sandbox_id')
		.notNull()
		.references(() => sandboxTable.id, { onDelete: 'cascade' }),
	pid: integer('pid'),
	status: text('status').notNull(),
	exitCode: integer('exit_code'),
	exitSignal: integer('exit_signal'),
	terminationReason: text('termination_reason'),
	terminationDetail: text('termination_detail'),
	signalsSent: text('signals_sent'),
	startedAt: text('started_at'),
	terminatedAt: text('terminated_at')
});

export const sandboxImageTable = sqliteTable('sandbox_image', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sandboxId: integer('sandbox_id')
		.notNull()
		.references(() => sandboxTable.id, { onDelete: 'cascade' }),
	imageId: integer('image_id')
		.notNull()
		.references(() => imageTable.id, { onDelete: 'cascade' }),
	manifestDigest: text('manifest_digest').notNull(),
	createdAt: text('created_at')
});

export const sandboxMetricTable = sqliteTable('sandbox_metric', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sandboxId: integer('sandbox_id')
		.notNull()
		.references(() => sandboxTable.id, { onDelete: 'cascade' }),
	cpuPercent: real('cpu_percent'),
	memoryBytes: integer('memory_bytes'),
	diskReadBytes: integer('disk_read_bytes'),
	diskWriteBytes: integer('disk_write_bytes'),
	netRxBytes: integer('net_rx_bytes'),
	netTxBytes: integer('net_tx_bytes'),
	sampledAt: text('sampled_at'),
	createdAt: text('created_at')
});

export const seaqlMigrationsTable = sqliteTable('seaql_migrations', {
	version: text('version').primaryKey().notNull(),
	appliedAt: integer('applied_at').notNull()
});

export const snapshotTable = sqliteTable('snapshot', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	sandboxId: integer('sandbox_id').references(() => sandboxTable.id, { onDelete: 'set null' }),
	sizeBytes: integer('size_bytes'),
	description: text('description'),
	createdAt: text('created_at')
});

export const volumeTable = sqliteTable('volume', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	quotaMib: integer('quota_mib'),
	sizeBytes: integer('size_bytes'),
	labels: text('labels'),
	createdAt: text('created_at'),
	updatedAt: text('updated_at')
});

export const imageRelations = relations(imageTable, ({ many }) => ({
	indexes: many(indexTable),
	manifests: many(manifestTable),
	sandboxImages: many(sandboxImageTable)
}));

export const indexRelations = relations(indexTable, ({ one, many }) => ({
	image: one(imageTable, {
		fields: [indexTable.imageId],
		references: [imageTable.id]
	}),
	manifests: many(manifestTable)
}));

export const manifestRelations = relations(manifestTable, ({ one, many }) => ({
	image: one(imageTable, {
		fields: [manifestTable.imageId],
		references: [imageTable.id]
	}),
	index: one(indexTable, {
		fields: [manifestTable.indexId],
		references: [indexTable.id]
	}),
	config: one(configTable),
	layers: many(manifestLayerTable)
}));

export const configRelations = relations(configTable, ({ one }) => ({
	manifest: one(manifestTable, {
		fields: [configTable.manifestId],
		references: [manifestTable.id]
	})
}));

export const layerRelations = relations(layerTable, ({ many }) => ({
	manifests: many(manifestLayerTable)
}));

export const manifestLayerRelations = relations(manifestLayerTable, ({ one }) => ({
	manifest: one(manifestTable, {
		fields: [manifestLayerTable.manifestId],
		references: [manifestTable.id]
	}),
	layer: one(layerTable, {
		fields: [manifestLayerTable.layerId],
		references: [layerTable.id]
	})
}));

export const sandboxRelations = relations(sandboxTable, ({ many }) => ({
	runs: many(runTable),
	images: many(sandboxImageTable),
	metrics: many(sandboxMetricTable),
	snapshots: many(snapshotTable)
}));

export const runRelations = relations(runTable, ({ one }) => ({
	sandbox: one(sandboxTable, {
		fields: [runTable.sandboxId],
		references: [sandboxTable.id]
	})
}));

export const sandboxImageRelations = relations(sandboxImageTable, ({ one }) => ({
	sandbox: one(sandboxTable, {
		fields: [sandboxImageTable.sandboxId],
		references: [sandboxTable.id]
	}),
	image: one(imageTable, {
		fields: [sandboxImageTable.imageId],
		references: [imageTable.id]
	})
}));

export const sandboxMetricRelations = relations(sandboxMetricTable, ({ one }) => ({
	sandbox: one(sandboxTable, {
		fields: [sandboxMetricTable.sandboxId],
		references: [sandboxTable.id]
	})
}));

export const snapshotRelations = relations(snapshotTable, ({ one }) => ({
	sandbox: one(sandboxTable, {
		fields: [snapshotTable.sandboxId],
		references: [sandboxTable.id]
	})
}));

export type Image = typeof imageTable.$inferSelect;
export type NewImage = typeof imageTable.$inferInsert;

export type Index = typeof indexTable.$inferSelect;
export type NewIndex = typeof indexTable.$inferInsert;

export type Manifest = typeof manifestTable.$inferSelect;
export type NewManifest = typeof manifestTable.$inferInsert;

export type Config = typeof configTable.$inferSelect;
export type NewConfig = typeof configTable.$inferInsert;

export type Layer = typeof layerTable.$inferSelect;
export type NewLayer = typeof layerTable.$inferInsert;

export type ManifestLayer = typeof manifestLayerTable.$inferSelect;
export type NewManifestLayer = typeof manifestLayerTable.$inferInsert;

export type Sandbox = typeof sandboxTable.$inferSelect;
export type NewSandbox = typeof sandboxTable.$inferInsert;

export type Run = typeof runTable.$inferSelect;
export type NewRun = typeof runTable.$inferInsert;

export type SandboxImage = typeof sandboxImageTable.$inferSelect;
export type NewSandboxImage = typeof sandboxImageTable.$inferInsert;

export type SandboxMetric = typeof sandboxMetricTable.$inferSelect;
export type NewSandboxMetric = typeof sandboxMetricTable.$inferInsert;

export type SeaqlMigration = typeof seaqlMigrationsTable.$inferSelect;
export type NewSeaqlMigration = typeof seaqlMigrationsTable.$inferInsert;

export type Snapshot = typeof snapshotTable.$inferSelect;
export type NewSnapshot = typeof snapshotTable.$inferInsert;

export type Volume = typeof volumeTable.$inferSelect;
export type NewVolume = typeof volumeTable.$inferInsert;
