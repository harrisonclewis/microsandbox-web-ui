import * as v from 'valibot';
import { omitEmptyDeep } from '$lib/json-fields/sanitize.js';
import type { ExecConfig } from 'microsandbox';

export const MAX_JSON_STRING_CHARS = 512_000;
export const MAX_ARGS = 256;
export const MAX_ARG_LENGTH = 8192;
export const MAX_PATCHES = 256;

const policyRuleSchema = v.object({
	action: v.picklist(['allow', 'deny'] as const),
	direction: v.optional(v.picklist(['outbound', 'inbound'] as const)),
	destination: v.optional(v.pipe(v.string(), v.maxLength(2048))),
	protocol: v.optional(v.picklist(['tcp', 'udp', 'icmpv4', 'icmpv6'] as const)),
	port: v.optional(v.pipe(v.string(), v.maxLength(128)))
});

const tlsConfigSchema = v.object({
	bypass: v.optional(v.array(v.pipe(v.string(), v.maxLength(1024)))),
	verifyUpstream: v.optional(v.boolean()),
	interceptedPorts: v.optional(
		v.array(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(65535)))
	),
	blockQuic: v.optional(v.boolean()),
	caCert: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	caKey: v.optional(v.pipe(v.string(), v.maxLength(4096)))
});

/** Matches `NetworkConfig` from microsandbox (validated subset). */
export const networkConfigSchema = v.object({
	policy: v.optional(v.pipe(v.string(), v.maxLength(128))),
	rules: v.optional(v.array(policyRuleSchema)),
	defaultAction: v.optional(v.picklist(['allow', 'deny'] as const)),
	blockDomains: v.optional(v.array(v.pipe(v.string(), v.maxLength(512)))),
	blockDomainSuffixes: v.optional(v.array(v.pipe(v.string(), v.maxLength(512)))),
	dnsRebindProtection: v.optional(v.boolean()),
	tls: v.optional(tlsConfigSchema),
	maxConnections: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1_000_000)))
});

export type ValidatedNetworkConfig = v.InferOutput<typeof networkConfigSchema>;

export const stringArrayArgsSchema = v.pipe(
	v.array(v.pipe(v.string(), v.maxLength(MAX_ARG_LENGTH))),
	v.maxLength(MAX_ARGS)
);

export const execConfigSchema = v.object({
	cmd: v.pipe(v.string(), v.nonEmpty(), v.maxLength(4096)),
	args: v.optional(stringArrayArgsSchema),
	cwd: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	user: v.optional(v.pipe(v.string(), v.maxLength(512))),
	env: v.optional(v.record(v.string(), v.pipe(v.string(), v.maxLength(65536)))),
	timeoutMs: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(86_400_000))),
	stdin: v.optional(v.pipe(v.string(), v.maxLength(256 * 1024))),
	tty: v.optional(v.boolean())
});

export type ValidatedExecConfig = v.InferOutput<typeof execConfigSchema>;

export const patchConfigSchema = v.object({
	kind: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.picklist(['text', 'file', 'append', 'copyFile', 'copyDir', 'symlink', 'mkdir', 'remove'] as const)
	),
	path: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	content: v.optional(v.pipe(v.string(), v.maxLength(1024 * 1024))),
	src: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	dst: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	target: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	link: v.optional(v.pipe(v.string(), v.maxLength(4096))),
	mode: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0o7777))),
	replace: v.optional(v.boolean())
});

export const patchesArraySchema = v.pipe(v.array(patchConfigSchema), v.maxLength(MAX_PATCHES));

export const volumeLabelsSchema = v.record(
	v.pipe(v.string(), v.nonEmpty(), v.maxLength(256)),
	v.pipe(v.string(), v.maxLength(4096))
);

export function formatValibotIssues(issues: readonly v.BaseIssue<unknown>[]): string {
	return issues.map((i) => (i as { message?: string }).message ?? 'Invalid value').join('; ');
}

export function parseJsonString(raw: string): unknown {
	const t = raw.trim();
	if (t.length > MAX_JSON_STRING_CHARS) {
		throw new Error(`JSON must be at most ${MAX_JSON_STRING_CHARS} characters`);
	}
	try {
		return JSON.parse(t) as unknown;
	} catch {
		throw new Error('Invalid JSON');
	}
}

/** Drop empty strings / empty containers before schema validation (UI often sends ""). */
export function normalizeJsonForValidation(value: unknown): unknown {
	return omitEmptyDeep(value);
}

export function parseExecConfigJson(configJson: string): ValidatedExecConfig {
	const parsed = parseJsonString(configJson);
	const cleaned = normalizeJsonForValidation(parsed);
	const result = v.safeParse(execConfigSchema, cleaned);
	if (!result.success) {
		throw new Error(`Exec config: ${formatValibotIssues(result.issues)}`);
	}
	return result.output;
}

export function parseArgsJsonString(argsJson: string): string[] {
	const parsed = parseJsonString(argsJson);
	const result = v.safeParse(stringArrayArgsSchema, parsed);
	if (!result.success) {
		throw new Error(`Arguments: ${formatValibotIssues(result.issues)}`);
	}
	return result.output;
}

export function assertExecConfigForSdk(config: ValidatedExecConfig): ExecConfig {
	return config as ExecConfig;
}
