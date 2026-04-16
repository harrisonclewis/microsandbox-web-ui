import type { SandboxInfo as MicrosandboxInfo } from "microsandbox";

type Nullable<T> = T | null;

type TaggedValue<TTag extends string, TValue = string> = {
	[K in TTag]: TValue;
};

export const SandboxStatus = {
    Running: "running",
    Stopped: "stopped",
    Crashed: "crashed",
    Draining: "draining"
} as const;

export type SandboxInfoConfig = {
	name: string;
	image: TaggedValue<"Oci">;
	cpus: number;
	memory_mib: number;
	log_level: Nullable<string>;
	workdir: Nullable<string>;
	shell: Nullable<string>;
	scripts: Record<string, string>;
	env: Array<[string, string]>;
	mounts: Array<{
		type: string;
		host?: string;
		guest: string;
		readonly?: boolean;
	}>;
	patches: unknown[];
	network: {
		enabled: boolean;
		interface: {
			mac: Nullable<string>;
			mtu: Nullable<number>;
			ipv4_address: Nullable<string>;
			ipv6_address: Nullable<string>;
		};
		ports: unknown[];
		policy: {
			default_action: string;
			rules: Array<{
				direction: string;
				destination: TaggedValue<"Group"> | Record<string, unknown>;
				protocol: Nullable<string>;
				ports: Nullable<number[]>;
				action: string;
			}>;
		};
		dns: {
			blocked_domains: string[];
			blocked_suffixes: string[];
			rebind_protection: boolean;
		};
		tls: {
			enabled: boolean;
			intercepted_ports: number[];
			bypass: string[];
			verify_upstream: boolean;
			block_quic_on_intercept: boolean;
			ca: {
				cert_path: Nullable<string>;
				key_path: Nullable<string>;
			};
			cache: {
				capacity: number;
				validity_hours: number;
			};
		};
		secrets: {
			secrets: unknown[];
			on_violation: string;
		};
		max_connections: Nullable<number>;
	};
	secrets: Record<string, unknown>;
	ssh: Record<string, unknown>;
	entrypoint: Nullable<string>;
	cmd: string[];
	hostname: Nullable<string>;
	user: Nullable<string>;
	labels: Record<string, string>;
	stop_signal: Nullable<string>;
	pull_policy: string;
	policy: {
		max_duration_secs: Nullable<number>;
		idle_timeout_secs: Nullable<number>;
	};
	resolved_rootfs_layers: string[];
	[key: string]: unknown;
};

export type SandboxInfoWithConfig = Omit<MicrosandboxInfo, "configJson"> & {
	config: SandboxInfoConfig | null;
};

export function parseSandboxInfoConfig(configJson: string): SandboxInfoConfig | null {
	try {
		return JSON.parse(configJson) as SandboxInfoConfig;
	} catch {
		return null;
	}
}

export function toSandboxInfoWithConfig(sandbox: MicrosandboxInfo): SandboxInfoWithConfig {
	return {
		...sandbox,
		config: parseSandboxInfoConfig(sandbox.configJson),
	};
}