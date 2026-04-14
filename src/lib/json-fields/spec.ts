/**
 * Declarative specs for Simple-mode structured JSON editing.
 * Keys are fixed to match SDK/backend field names.
 */

export type JsonPrimitiveType = 'string' | 'number' | 'boolean';

export type JsonEnumOption = { value: string; label: string };

/** One property in an object schema */
export type JsonPropertySpec =
	| {
			key: string;
			label: string;
			description?: string;
			type: JsonPrimitiveType;
			required?: boolean;
			placeholder?: string;
			min?: number;
			max?: number;
	  }
	| {
			key: string;
			label: string;
			description?: string;
			type: 'enum';
			required?: boolean;
			options: JsonEnumOption[];
	  }
	| {
			key: string;
			label: string;
			description?: string;
			type: 'object';
			required?: boolean;
			properties: JsonPropertySpec[];
	  }
	| {
			key: string;
			label: string;
			description?: string;
			type: 'array';
			required?: boolean;
			/** Array of strings (e.g. command arguments) */
			of: 'string';
			itemPlaceholder?: string;
			maxItems?: number;
	  }
	| {
			key: string;
			label: string;
			description?: string;
			type: 'array';
			required?: boolean;
			of: 'number';
			itemPlaceholder?: string;
			maxItems?: number;
	  }
	| {
			key: string;
			label: string;
			description?: string;
			type: 'array';
			required?: boolean;
			of: 'object';
			itemLabel?: string;
			itemProperties: JsonPropertySpec[];
			maxItems?: number;
	  };

export type JsonObjectSpec = {
	title?: string;
	description?: string;
	properties: JsonPropertySpec[];
};

/** Root specs the UI understands */
export type JsonRootSpec =
	| ({ mode: 'object' } & JsonObjectSpec)
	| {
			mode: 'array';
			title?: string;
			description?: string;
			itemLabel?: string;
			itemProperties: JsonPropertySpec[];
			maxItems?: number;
	  }
	| {
			mode: 'stringArray';
			title?: string;
			description?: string;
			itemPlaceholder?: string;
			maxItems?: number;
	  }
	| {
			mode: 'keyValue';
			title?: string;
			description?: string;
			keyPlaceholder?: string;
			valuePlaceholder?: string;
			maxPairs?: number;
	  };

/** Build an empty value for a root spec (for Simple mode defaults). */
export function emptyValueForRootSpec(spec: JsonRootSpec): unknown {
	switch (spec.mode) {
		case 'stringArray':
			return [];
		case 'array':
			return [];
		case 'keyValue':
			return {};
		case 'object':
			return emptyObjectFromProperties(spec.properties);
		default:
			return {};
	}
}

function emptyObjectFromProperties(properties: JsonPropertySpec[]): Record<string, unknown> {
	const o: Record<string, unknown> = {};
	for (const p of properties) {
		switch (p.type) {
			case 'string':
			case 'enum':
				o[p.key] = '';
				break;
			case 'number':
				o[p.key] = undefined;
				break;
			case 'boolean':
				o[p.key] = false;
				break;
			case 'object':
				o[p.key] = emptyObjectFromProperties(p.properties);
				break;
			case 'array':
				o[p.key] = [];
				break;
			default:
				break;
		}
	}
	return o;
}

export function stableStringify(value: unknown): string {
	return JSON.stringify(value, null, 2);
}

/** Empty object for one array-of-object item */
export function emptyItemFromProperties(properties: JsonPropertySpec[]): Record<string, unknown> {
	return emptyObjectFromProperties(properties);
}
