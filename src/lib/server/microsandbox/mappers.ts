import type {
	MountConfig,
	NetworkConfig,
	PatchConfig,
	SandboxConfig,
	SecretEntry
} from 'microsandbox';
import type { SandboxCreatePayload } from './sdk-form-schemas.js';

/** Mount row from UI / JSON */
export type MountInput = NonNullable<SandboxCreatePayload['mounts']>[number];

/** Network preset or custom */
export type NetworkInput = NonNullable<SandboxCreatePayload['network']>;

/** Secret row before Secret.env() */
export type SecretInput = NonNullable<SandboxCreatePayload['secrets']>[number];

export function mountsToVolumes(mounts: MountInput[] | undefined): Record<string, MountConfig> | undefined {
	if (!mounts?.length) return undefined;
	const out: Record<string, MountConfig> = {};
	for (const m of mounts) {
		const guest = m.guestPath.trim();
		if (!guest.startsWith('/')) continue;
		if (m.type === 'bind' && m.bindHostPath) {
			out[guest] = { bind: m.bindHostPath, readonly: m.readonly };
		} else if (m.type === 'named' && m.namedVolume) {
			out[guest] = { named: m.namedVolume, readonly: m.readonly };
		} else if (m.type === 'tmpfs') {
			out[guest] = {
				tmpfs: true,
				readonly: m.readonly,
				...(m.tmpfsSizeMib != null ? { sizeMib: m.tmpfsSizeMib } : {})
			};
		}
	}
	return Object.keys(out).length ? out : undefined;
}

export function resolveNetwork(
	msb: { NetworkPolicy: { none: () => NetworkConfig; publicOnly: () => NetworkConfig; allowAll: () => NetworkConfig } },
	input: NetworkInput | undefined
): NetworkConfig | undefined {
	if (!input) return msb.NetworkPolicy.publicOnly();
	if (input.mode === 'none') return msb.NetworkPolicy.none();
	if (input.mode === 'publicOnly') return msb.NetworkPolicy.publicOnly();
	if (input.mode === 'allowAll') return msb.NetworkPolicy.allowAll();
	// `config` validated by `networkConfigSchema` in sandbox create payload (matches SDK `NetworkConfig`).
	if (input.mode === 'custom') return input.config as NetworkConfig;
	return msb.NetworkPolicy.publicOnly();
}

export function buildSecrets(msb: { Secret: { env: (v: string, o: import('microsandbox').SecretEnvOptions) => SecretEntry } }, secrets: SecretInput[] | undefined): SecretEntry[] | undefined {
	if (!secrets?.length) return undefined;
	return secrets.map((s) =>
		msb.Secret.env(s.envVar, {
			value: s.value,
			...(s.allowHosts?.length ? { allowHosts: s.allowHosts } : {}),
			...(s.allowHostPatterns?.length ? { allowHostPatterns: s.allowHostPatterns } : {}),
			...(s.placeholder != null && s.placeholder !== '' ? { placeholder: s.placeholder } : {}),
			...(s.requireTls != null ? { requireTls: s.requireTls } : {}),
			...(s.onViolation != null && s.onViolation !== '' ? { onViolation: s.onViolation } : {})
		})
	);
}

export function toSandboxConfig(
	msb: Parameters<typeof buildSecrets>[0] & Parameters<typeof resolveNetwork>[0],
	input: SandboxCreatePayload
): SandboxConfig {
	const volumes = mountsToVolumes(input.mounts);
	const network = resolveNetwork(msb, input.network);
	const secrets = buildSecrets(msb, input.secrets);

	const config: SandboxConfig = {
		name: input.name,
		image: input.image,
		...(input.cpus != null ? { cpus: input.cpus } : {}),
		...(input.memoryMib != null ? { memoryMib: input.memoryMib } : {}),
		...(input.workdir ? { workdir: input.workdir } : {}),
		...(input.shell ? { shell: input.shell } : {}),
		...(input.entrypoint?.length ? { entrypoint: input.entrypoint } : {}),
		...(input.cmd?.length ? { cmd: input.cmd } : {}),
		...(input.hostname ? { hostname: input.hostname } : {}),
		...(input.user ? { user: input.user } : {}),
		...(input.env && Object.keys(input.env).length ? { env: input.env } : {}),
		...(input.scripts && Object.keys(input.scripts).length ? { scripts: input.scripts } : {}),
		...(volumes ? { volumes } : {}),
		...(input.patches?.length ? { patches: input.patches } : {}),
		...(input.pullPolicy ? { pullPolicy: input.pullPolicy } : {}),
		...(input.logLevel ? { logLevel: input.logLevel } : {}),
		...(input.quietLogs != null ? { quietLogs: input.quietLogs } : {}),
		...(input.labels && Object.keys(input.labels).length ? { labels: input.labels } : {}),
		...(input.stopSignal ? { stopSignal: input.stopSignal } : {}),
		...(input.maxDurationSecs != null ? { maxDurationSecs: input.maxDurationSecs } : {}),
		...(input.registryAuth ? { registryAuth: input.registryAuth } : {}),
		...(input.ports && Object.keys(input.ports).length ? { ports: input.ports } : {}),
		...(network ? { network } : {}),
		...(secrets?.length ? { secrets } : {}),
		...(input.replace ? { replace: true } : {})
	};

	return config;
}
