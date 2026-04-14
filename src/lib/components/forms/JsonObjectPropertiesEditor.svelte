<script lang="ts">
	import type { JsonPropertySpec } from '$lib/json-fields/spec.js';
	import { emptyItemFromProperties } from '$lib/json-fields/spec.js';
	import JsonKeyValueEditor from './JsonKeyValueEditor.svelte';
	import JsonObjectPropertiesEditor from './JsonObjectPropertiesEditor.svelte';

	let {
		properties,
		value,
		onChange,
		disabled = false
	}: {
		properties: JsonPropertySpec[];
		value: Record<string, unknown>;
		onChange: (next: Record<string, unknown>) => void;
		disabled?: boolean;
	} = $props();

	function setKey(k: string, v: unknown) {
		const next = { ...value };
		if (v === undefined) delete next[k];
		else next[k] = v;
		onChange(next);
	}

	function getStr(key: string): string {
		const v = value[key];
		return typeof v === 'string' ? v : v == null ? '' : String(v);
	}

	function setNum(key: string, s: string, required: boolean | undefined) {
		const t = s.trim();
		const next = { ...value };
		if (t === '') {
			if (!required) delete next[key];
			else next[key] = undefined;
			onChange(next);
			return;
		}
		const n = Number(t);
		next[key] = Number.isFinite(n) ? n : undefined;
		onChange(next);
	}

	function getNum(key: string): string {
		const v = value[key];
		if (v === undefined || v === null) return '';
		if (typeof v === 'number' && Number.isFinite(v)) return String(v);
		return '';
	}

	function getBool(key: string): boolean {
		return Boolean(value[key]);
	}

	function getStrArray(key: string): string[] {
		const v = value[key];
		if (!Array.isArray(v)) return [''];
		return v.length ? v.map((x) => (typeof x === 'string' ? x : String(x))) : [''];
	}

	function setStrArray(key: string, arr: string[]) {
		const filtered = arr.map((s) => s).filter((s) => s.trim() !== '');
		const next = { ...value };
		if (filtered.length === 0) delete next[key];
		else next[key] = filtered;
		onChange(next);
	}

	function getNumArray(key: string): string[] {
		const v = value[key];
		if (!Array.isArray(v)) return [''];
		return v.length
			? v.map((x) => (typeof x === 'number' && Number.isFinite(x) ? String(x) : ''))
			: [''];
	}

	function setNumArray(key: string, arr: string[]) {
		const nums = arr
			.map((s) => s.trim())
			.filter(Boolean)
			.map((s) => Number(s))
			.filter((n) => Number.isFinite(n));
		const next = { ...value };
		if (nums.length === 0) delete next[key];
		else next[key] = nums;
		onChange(next);
	}

	function getObjArray(key: string): Record<string, unknown>[] {
		const v = value[key];
		if (!Array.isArray(v)) return [];
		return v.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
	}

	function setObjArray(key: string, arr: Record<string, unknown>[]) {
		setKey(key, arr);
	}

	function addObjItem(key: string, itemProps: JsonPropertySpec[], max: number | undefined) {
		const cur = getObjArray(key);
		if (max != null && cur.length >= max) return;
		setObjArray(key, [...cur, emptyItemFromProperties(itemProps)]);
	}

	function removeObjItem(key: string, i: number) {
		const cur = getObjArray(key);
		setObjArray(
			key,
			cur.filter((_, j) => j !== i)
		);
	}

	function patchObjItem(key: string, i: number, nextItem: Record<string, unknown>) {
		const cur = getObjArray(key);
		const copy = [...cur];
		copy[i] = nextItem;
		setObjArray(key, copy);
	}

	function getRecordString(key: string): Record<string, string> {
		const v = value[key];
		if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
		const o: Record<string, string> = {};
		for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
			if (typeof val === 'string') o[k] = val;
			else if (val != null) o[k] = String(val);
		}
		return o;
	}
</script>

<div>
	{#each properties as p (p.key)}
		<div>
			<div>
				<span>
					{p.label}
					{#if 'required' in p && p.required}<span>*</span>{/if}
				</span>
				{#if p.description}<span>{p.description}</span>{/if}
			</div>

			{#if p.type === 'string'}
				<input
					type="text"
					placeholder={'placeholder' in p ? p.placeholder : ''}
					value={getStr(p.key)}
					{disabled}
					oninput={(e) => setKey(p.key, (e.currentTarget as HTMLInputElement).value)}
				/>
			{:else if p.type === 'number'}
				<input
					type="number"
					value={getNum(p.key)}
					min={p.min}
					max={p.max}
					{disabled}
					oninput={(e) => setNum(p.key, (e.currentTarget as HTMLInputElement).value, p.required)}
				/>
			{:else if p.type === 'boolean'}
				<label>
					<input
						type="checkbox"
						checked={getBool(p.key)}
						{disabled}
						onchange={(e) => setKey(p.key, (e.currentTarget as HTMLInputElement).checked)}
					/>
				</label>
			{:else if p.type === 'enum'}
				<select
					value={getStr(p.key)}
					{disabled}
					onchange={(e) => setKey(p.key, (e.currentTarget as HTMLSelectElement).value)}
				>
					{#each p.options as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			{:else if p.type === 'object'}
				{#if p.properties.length === 0}
					<JsonKeyValueEditor
						value={getRecordString(p.key)}
						onValueChange={(rec) => setKey(p.key, rec)}
						{disabled}
					/>
				{:else}
					<div>
						<JsonObjectPropertiesEditor
							properties={p.properties}
							value={(value[p.key] as Record<string, unknown>) ?? {}}
							onChange={(nested: Record<string, unknown>) => setKey(p.key, nested)}
							{disabled}
						/>
					</div>
				{/if}
			{:else if p.type === 'array' && p.of === 'string'}
				{@const arr = getStrArray(p.key)}
				<div>
					{#each arr as _item, idx (idx)}
						<div>
							<input
								type="text"
								placeholder={p.itemPlaceholder}
								value={arr[idx]}
								{disabled}
								oninput={(e) => {
									const next = [...arr];
									next[idx] = (e.currentTarget as HTMLInputElement).value;
									setStrArray(p.key, next);
								}}
							/>
							<button
								type="button"
								{disabled}
								onclick={() => {
									const next = arr.filter((_, j) => j !== idx);
									setStrArray(p.key, next.length ? next : ['']);
								}}>✕</button
							>
						</div>
					{/each}
					<button
						type="button"
						{disabled}
						onclick={() => {
							const filled = arr.filter((s) => s.trim()).length;
							if (p.maxItems != null && filled >= p.maxItems) return;
							setStrArray(p.key, [...arr, '']);
						}}>+ Add</button
					>
				</div>
			{:else if p.type === 'array' && p.of === 'number'}
				{@const arr = getNumArray(p.key)}
				<div>
					{#each arr as _item, idx (idx)}
						<div>
							<input
								type="number"
								placeholder={p.itemPlaceholder}
								value={arr[idx]}
								{disabled}
								oninput={(e) => {
									const next = [...arr];
									next[idx] = (e.currentTarget as HTMLInputElement).value;
									setNumArray(p.key, next);
								}}
							/>
							<button
								type="button"
								{disabled}
								onclick={() => {
									const next = arr.filter((_, j) => j !== idx);
									setNumArray(p.key, next.length ? next : ['']);
								}}>✕</button
							>
						</div>
					{/each}
					<button
						type="button"
						{disabled}
						onclick={() => {
							const filled = arr.filter((s) => s.trim()).length;
							if (p.maxItems != null && filled >= p.maxItems) return;
							setNumArray(p.key, [...arr, '']);
						}}>+ Add</button
					>
				</div>
			{:else if p.type === 'array' && p.of === 'object'}
				{@const items = getObjArray(p.key)}
				<div>
					{#each items as item, idx (idx)}
						<fieldset>
							<legend>{p.itemLabel ?? 'Item'} {idx + 1}</legend>
							<button type="button" {disabled} onclick={() => removeObjItem(p.key, idx)}>Remove</button>
							<JsonObjectPropertiesEditor
								properties={p.itemProperties}
								value={item}
								onChange={(nextItem: Record<string, unknown>) => patchObjItem(p.key, idx, nextItem)}
								{disabled}
							/>
						</fieldset>
					{/each}
					<button
						type="button"
						{disabled}
						onclick={() => addObjItem(p.key, p.itemProperties, p.maxItems)}>+ Add {p.itemLabel ?? 'item'}</button
					>
				</div>
			{/if}
		</div>
	{/each}
</div>
