import * as v from 'valibot';
import { networkConfigSchema, patchesArraySchema } from './json-validators.js';

const nonEmptyString = v.pipe(v.string(), v.nonEmpty());

/** Optional JSON object map */
const recordString = v.record(v.string(), v.string());

const mountRow = v.object({
	guestPath: nonEmptyString,
	type: v.picklist(['bind', 'named', 'tmpfs'] as const),
	bindHostPath: v.optional(v.string()),
	namedVolume: v.optional(v.string()),
	tmpfsSizeMib: v.optional(v.number()),
	readonly: v.optional(v.boolean())
});

const secretRow = v.object({
	envVar: nonEmptyString,
	value: nonEmptyString,
	allowHosts: v.optional(v.array(v.string())),
	allowHostPatterns: v.optional(v.array(v.string())),
	placeholder: v.optional(v.string()),
	requireTls: v.optional(v.boolean()),
	onViolation: v.optional(v.string())
});

/** Parsed sandbox create body (matches SandboxCreateInput) */
export const sandboxCreatePayloadSchema = v.object({
	name: nonEmptyString,
	image: nonEmptyString,
	detached: v.optional(v.boolean()),
	replace: v.optional(v.boolean()),
	cpus: v.optional(v.number()),
	memoryMib: v.optional(v.number()),
	workdir: v.optional(v.string()),
	shell: v.optional(v.string()),
	entrypoint: v.optional(v.array(v.string())),
	cmd: v.optional(v.array(v.string())),
	hostname: v.optional(v.string()),
	user: v.optional(v.string()),
	env: v.optional(recordString),
	scripts: v.optional(v.record(v.string(), v.string())),
	labels: v.optional(recordString),
	pullPolicy: v.optional(v.string()),
	logLevel: v.optional(v.string()),
	quietLogs: v.optional(v.boolean()),
	stopSignal: v.optional(v.string()),
	maxDurationSecs: v.optional(v.number()),
	registryAuth: v.optional(
		v.object({
			username: nonEmptyString,
			password: nonEmptyString
		})
	),
	ports: v.optional(v.record(v.string(), v.number())),
	mounts: v.optional(v.array(mountRow)),
	patches: v.optional(patchesArraySchema),
	network: v.optional(
		v.union([
			v.object({ mode: v.picklist(['none', 'publicOnly', 'allowAll'] as const) }),
			v.object({
				mode: v.literal('custom'),
				config: networkConfigSchema
			})
		])
	),
	secrets: v.optional(v.array(secretRow))
});

export type SandboxCreatePayload = v.InferOutput<typeof sandboxCreatePayloadSchema>;

/** Form posts a single JSON string field `payload`. */
export const sandboxCreateFormSchema = v.object({
	payload: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.transform((s) => JSON.parse(s) as unknown),
		sandboxCreatePayloadSchema
	)
});

export const confirmTokenSchema = v.pipe(v.string(), v.nonEmpty());

export const sandboxNameSchema = v.pipe(
	v.string(),
	v.nonEmpty(),
	v.maxLength(256),
	v.regex(/^[a-zA-Z0-9._-]+$/, 'Use letters, numbers, dot, underscore, hyphen only')
);
