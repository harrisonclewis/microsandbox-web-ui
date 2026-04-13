import { z } from 'zod';

/**
 * Engine sandbox config JSON (snake_case, tagged unions). Differs from the JS API `SandboxConfig` in microsandbox.
 * Validate DB text with `DbJson.column(sandboxEngineConfigSchema, raw)` from `$lib/validation/db-json`.
 */
/** Both optional so the inferred type allows `image.Oci` / `image.Path` in templates without a union narrow. */
export const sandboxEngineImageRefSchema = z
	.object({
		Oci: z.string().optional(),
		Path: z.string().optional()
	})
	.passthrough()
	.superRefine((val, ctx) => {
		if (val.Oci == null && val.Path == null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'image must include Oci and/or Path'
			});
		}
	});

export type SandboxEngineImageRef = z.infer<typeof sandboxEngineImageRefSchema>;

export const sandboxEngineConfigSchema = z
	.object({
		name: z.string(),
		image: sandboxEngineImageRefSchema,
		cpus: z.number().optional(),
		memory_mib: z.number().optional(),
		log_level: z.string().nullable().optional(),
		workdir: z.string().nullable().optional(),
		shell: z.string().nullable().optional(),
		scripts: z.record(z.string(), z.unknown()).optional(),
		env: z.array(z.tuple([z.string(), z.string()])).optional(),
		mounts: z.array(z.record(z.string(), z.unknown())).optional(),
		patches: z.array(z.unknown()).optional(),
		network: z.record(z.string(), z.unknown()).optional(),
		secrets: z.record(z.string(), z.unknown()).optional(),
		ssh: z.record(z.string(), z.unknown()).optional(),
		entrypoint: z.array(z.string()).nullable().optional(),
		cmd: z.array(z.string()).nullable().optional(),
		hostname: z.string().nullable().optional(),
		user: z.string().nullable().optional(),
		labels: z.record(z.string(), z.string()).optional(),
		stop_signal: z.string().nullable().optional(),
		pull_policy: z.string().optional(),
		policy: z
			.object({
				max_duration_secs: z.number().nullable().optional(),
				idle_timeout_secs: z.number().nullable().optional()
			})
			.passthrough()
			.optional(),
		resolved_rootfs_layers: z.array(z.string()).optional()
	})
	.passthrough();

export type SandboxEngineConfig = z.infer<typeof sandboxEngineConfigSchema>;
