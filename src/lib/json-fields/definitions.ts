import type { JsonPropertySpec, JsonRootSpec } from './spec.js';

/** ExecConfig (microsandbox) — Simple mode covers common fields */
export const execConfigSpec: JsonRootSpec = {
	mode: 'object',
	title: 'Command execution',
	description: 'Run a program inside the sandbox with optional working directory, user, environment, and timeout.',
	properties: [
		{
			key: 'cmd',
			label: 'Command',
			description: 'Executable name or path (e.g. uname, /bin/sh).',
			type: 'string',
			required: true,
			placeholder: 'uname'
		},
		{
			key: 'args',
			label: 'Arguments',
			description: 'One entry per argument (no JSON needed).',
			type: 'array',
			of: 'string',
			itemPlaceholder: 'argument',
			maxItems: 256
		},
		{
			key: 'cwd',
			label: 'Working directory',
			description: 'Directory inside the guest (optional).',
			type: 'string',
			placeholder: '/app'
		},
		{
			key: 'user',
			label: 'Run as user',
			description: 'User name or UID (optional).',
			type: 'string'
		},
		{
			key: 'timeoutMs',
			label: 'Timeout (ms)',
			description: 'Kill the process after this many milliseconds (optional).',
			type: 'number',
			min: 1,
			max: 86_400_000
		},
		{
			key: 'stdin',
			label: 'Stdin',
			description: 'Leave empty for default (null). Use "pipe" or a string to send as stdin bytes.',
			type: 'string',
			placeholder: 'pipe or text…'
		},
		{
			key: 'tty',
			label: 'Allocate pseudo-TTY',
			type: 'boolean'
		},
		{
			key: 'env',
			label: 'Environment variables',
			description: 'Extra environment variables for this command only.',
			type: 'object',
			properties: [] // rendered as key/value editor in the object branch when empty properties
		}
	]
};

/** String array for exec args / stream args */
export const stringArrayArgsSpec: JsonRootSpec = {
	mode: 'stringArray',
	title: 'Command arguments',
	description: 'One value per argument, in order. Leave empty for no extra arguments.',
	itemPlaceholder: 'argument',
	maxItems: 256
};

/** NetworkConfig for custom sandbox network */
export const networkCustomSpec: JsonRootSpec = {
	mode: 'object',
	title: 'Custom network policy',
	description:
		'Matches the sandbox network configuration: preset policy, rules, DNS blocks, and TLS options. Rules override the preset when present.',
	properties: [
		{
			key: 'policy',
			label: 'Preset policy',
			description: 'Ignored if you add rules below (first match wins).',
			type: 'enum',
			options: [
				{ value: '', label: '(not set)' },
				{ value: 'public-only', label: 'public-only (default-like)' },
				{ value: 'allow-all', label: 'allow-all' },
				{ value: 'none', label: 'none (offline)' }
			]
		},
		{
			key: 'defaultAction',
			label: 'Default action',
			description: 'When no rule matches: allow or deny.',
			type: 'enum',
			options: [
				{ value: '', label: '(not set)' },
				{ value: 'allow', label: 'allow' },
				{ value: 'deny', label: 'deny' }
			]
		},
		{
			key: 'rules',
			label: 'Rules',
			description: 'First matching rule wins. Action: allow | deny. Direction: outbound | inbound.',
			type: 'array',
			of: 'object',
			itemLabel: 'Rule',
			maxItems: 256,
			itemProperties: [
				{
					key: 'action',
					label: 'Action',
					type: 'enum',
					required: true,
					options: [
						{ value: 'allow', label: 'allow' },
						{ value: 'deny', label: 'deny' }
					]
				},
				{
					key: 'direction',
					label: 'Direction',
					type: 'enum',
					options: [
						{ value: '', label: '(any)' },
						{ value: 'outbound', label: 'outbound' },
						{ value: 'inbound', label: 'inbound' }
					]
				},
				{
					key: 'destination',
					label: 'Destination',
					description: '*, CIDR, domain, .suffix, or group: loopback, private, …',
					type: 'string',
					placeholder: 'example.com'
				},
				{
					key: 'protocol',
					label: 'Protocol',
					type: 'enum',
					options: [
						{ value: '', label: '(any)' },
						{ value: 'tcp', label: 'tcp' },
						{ value: 'udp', label: 'udp' },
						{ value: 'icmpv4', label: 'icmpv4' },
						{ value: 'icmpv6', label: 'icmpv6' }
					]
				},
				{
					key: 'port',
					label: 'Port / range',
					description: 'e.g. 443 or 8000-9000',
					type: 'string',
					placeholder: '443'
				}
			]
		},
		{
			key: 'blockDomains',
			label: 'Block domains',
			description: 'Blocked via DNS interception (one domain per line in Simple mode).',
			type: 'array',
			of: 'string',
			itemPlaceholder: 'ads.example.com',
			maxItems: 512
		},
		{
			key: 'blockDomainSuffixes',
			label: 'Block domain suffixes',
			type: 'array',
			of: 'string',
			itemPlaceholder: '.evil.com',
			maxItems: 512
		},
		{
			key: 'dnsRebindProtection',
			label: 'DNS rebinding protection',
			type: 'boolean'
		},
		{
			key: 'maxConnections',
			label: 'Max concurrent connections',
			type: 'number',
			min: 1,
			max: 1_000_000
		},
		{
			key: 'tls',
			label: 'TLS interception',
			type: 'object',
			properties: [
				{
					key: 'verifyUpstream',
					label: 'Verify upstream certificates',
					type: 'boolean'
				},
				{
					key: 'blockQuic',
					label: 'Block QUIC on intercepted ports',
					type: 'boolean'
				},
				{
					key: 'interceptedPorts',
					label: 'Intercepted ports',
					type: 'array',
					of: 'number',
					description: 'Default in SDK is [443].',
					itemPlaceholder: '443',
					maxItems: 64
				},
				{
					key: 'bypass',
					label: 'Bypass domains',
					type: 'array',
					of: 'string',
					itemPlaceholder: '*.trusted.com',
					maxItems: 256
				},
				{
					key: 'caCert',
					label: 'CA cert path (PEM)',
					type: 'string'
				},
				{
					key: 'caKey',
					label: 'CA key path (PEM)',
					type: 'string'
				}
			]
		}
	]
};

/** PatchConfig[] item */
export const patchItemProperties: JsonPropertySpec[] = [
	{
		key: 'kind',
		label: 'Kind',
		type: 'enum' as const,
		required: true,
		options: [
			{ value: 'text', label: 'text' },
			{ value: 'append', label: 'append' },
			{ value: 'mkdir', label: 'mkdir' },
			{ value: 'remove', label: 'remove' },
			{ value: 'copyFile', label: 'copyFile' },
			{ value: 'copyDir', label: 'copyDir' },
			{ value: 'symlink', label: 'symlink' }
		]
	},
	{
		key: 'path',
		label: 'path',
		description: 'Guest path (or link path for symlink)',
		type: 'string' as const,
		placeholder: '/etc/app.conf'
	},
	{
		key: 'content',
		label: 'content',
		description: 'For text / append',
		type: 'string' as const
	},
	{
		key: 'src',
		label: 'src',
		description: 'Host path for copyFile / copyDir',
		type: 'string' as const
	},
	{
		key: 'dst',
		label: 'dst',
		description: 'Guest path for copyFile / copyDir',
		type: 'string' as const
	},
	{
		key: 'target',
		label: 'target',
		description: 'Symlink target',
		type: 'string' as const
	},
	{
		key: 'link',
		label: 'link',
		description: 'Symlink path',
		type: 'string' as const
	},
	{
		key: 'mode',
		label: 'mode',
		description: 'File mode (e.g. 420 for 0o644)',
		type: 'number' as const,
		min: 0,
		max: 0o7777
	},
	{
		key: 'replace',
		label: 'replace',
		type: 'boolean' as const
	}
];

export const patchesArraySpec: JsonRootSpec = {
	mode: 'array',
	title: 'Rootfs patches',
	description: 'Ordered list of changes applied before boot. Fill fields that apply to the selected kind.',
	itemLabel: 'Patch',
	maxItems: 256,
	itemProperties: patchItemProperties
};

export const volumeLabelsSpec: JsonRootSpec = {
	mode: 'keyValue',
	title: 'Labels',
	description: 'Optional string labels stored on the volume.',
	keyPlaceholder: 'name',
	valuePlaceholder: 'value',
	maxPairs: 256
};

export const sandboxLabelsSpec: JsonRootSpec = {
	mode: 'keyValue',
	title: 'Labels',
	description: 'Optional key/value labels on the sandbox.',
	keyPlaceholder: 'team',
	valuePlaceholder: 'dev',
	maxPairs: 256
};
