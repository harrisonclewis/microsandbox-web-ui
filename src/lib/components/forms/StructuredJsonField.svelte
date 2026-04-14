<script lang="ts">
	import type { JsonRootSpec } from '$lib/json-fields/spec.js';
	import { emptyItemFromProperties, emptyValueForRootSpec, stableStringify } from '$lib/json-fields/spec.js';
	import JsonFieldModeToggle from './JsonFieldModeToggle.svelte';
	import JsonObjectPropertiesEditor from './JsonObjectPropertiesEditor.svelte';
	import JsonKeyValueEditor from './JsonKeyValueEditor.svelte';

	let {
		spec,
		json = $bindable(''),
		name,
		disabled = false
	}: {
		spec: JsonRootSpec;
		json?: string;
		name?: string;
		disabled?: boolean;
	} = $props();

	let mode = $state<'simple' | 'advanced'>('simple');
	let parseError = $state<string | null>(null);

	let simpleObject = $state<Record<string, unknown>>({});
	let simpleStringArr = $state<string[]>(['']);
	let simpleObjectArr = $state<Record<string, unknown>[]>([]);
	let simpleKv = $state<Record<string, string>>({});

	function syncJson() {
		if (spec.mode === 'object') {
			json = JSON.stringify(simpleObject, null, 2);
		} else if (spec.mode === 'stringArray') {
			const xs = simpleStringArr.map((s) => s.trim()).filter(Boolean);
			json = stableStringify(xs);
		} else if (spec.mode === 'array') {
			json = stableStringify(simpleObjectArr);
		} else {
			json = stableStringify(simpleKv);
		}
	}

	function ingestJson(text: string) {
		parseError = null;
		const t = text.trim();
		if (!t) {
			resetSimpleDefaults();
			syncJson();
			return;
		}
		try {
			const parsed = JSON.parse(t) as unknown;
			if (spec.mode === 'object' && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				simpleObject = parsed as Record<string, unknown>;
			} else if (spec.mode === 'stringArray' && Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
				simpleStringArr = parsed.length ? [...parsed] : [''];
			} else if (spec.mode === 'array' && Array.isArray(parsed) && parsed.every((x) => x && typeof x === 'object' && !Array.isArray(x))) {
				simpleObjectArr = parsed as Record<string, unknown>[];
			} else if (spec.mode === 'keyValue' && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				const o: Record<string, string> = {};
				for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
					if (typeof v === 'string') o[k] = v;
					else if (v != null) o[k] = String(v);
				}
				simpleKv = o;
			} else {
				parseError = 'JSON shape does not match this field.';
				resetSimpleDefaults();
			}
		} catch {
			parseError = 'Invalid JSON.';
			resetSimpleDefaults();
		}
	}

	function resetSimpleDefaults() {
		const empty = emptyValueForRootSpec(spec);
		if (spec.mode === 'object') {
			simpleObject = (empty as Record<string, unknown>) ?? {};
		} else if (spec.mode === 'stringArray') {
			simpleStringArr = (empty as string[]).length ? (empty as string[]) : [''];
		} else if (spec.mode === 'array') {
			simpleObjectArr = empty as Record<string, unknown>[];
		} else {
			simpleKv = (empty as Record<string, string>) ?? {};
		}
	}

	let didInit = $state(false);
	$effect.pre(() => {
		if (didInit) return;
		didInit = true;
		if (!json.trim()) {
			resetSimpleDefaults();
			syncJson();
		} else {
			ingestJson(json);
		}
	});

	function onModeChange(next: 'simple' | 'advanced') {
		if (next === 'advanced') syncJson();
		else ingestJson(json);
	}

	// string array root helpers
	function getRootStrArr(): string[] {
		return simpleStringArr.length ? simpleStringArr : [''];
	}

	function setRootStrArr(arr: string[]) {
		simpleStringArr = arr.length ? arr : [''];
		syncJson();
	}

	function addRootStrItem(max: number | undefined) {
		const arr = getRootStrArr();
		const filled = arr.filter((s) => s.trim()).length;
		if (max != null && filled >= max) return;
		setRootStrArr([...arr, '']);
	}
</script>

<section>
	<header>
		{#if spec.title}<h3>{spec.title}</h3>{/if}
		<JsonFieldModeToggle bind:mode onModeChange={onModeChange} />
	</header>
	{#if spec.description}<p>{spec.description}</p>{/if}

	{#if mode === 'simple'}
		{#if spec.mode === 'object'}
			<JsonObjectPropertiesEditor
				properties={spec.properties}
				value={simpleObject}
				onChange={(v) => {
					simpleObject = v;
					syncJson();
				}}
				{disabled}
			/>
		{:else if spec.mode === 'stringArray'}
			<div>
				{#each getRootStrArr() as _x, idx (idx)}
					<div>
						<input
							type="text"
							placeholder={spec.itemPlaceholder}
							value={getRootStrArr()[idx]}
							{disabled}
							oninput={(e) => {
								const next = [...getRootStrArr()];
								next[idx] = (e.currentTarget as HTMLInputElement).value;
								setRootStrArr(next);
							}}
						/>
						<button
							type="button"
							{disabled}
							onclick={() => {
								const arr = getRootStrArr();
								const next = arr.filter((_, j) => j !== idx);
								setRootStrArr(next.length ? next : ['']);
							}}>✕</button
						>
					</div>
				{/each}
				<button type="button" {disabled} onclick={() => addRootStrItem(spec.maxItems)}>+ Add argument</button>
			</div>
		{:else if spec.mode === 'array'}
			<div>
				{#each simpleObjectArr as item, idx (idx)}
					<fieldset>
						<legend>{spec.itemLabel ?? 'Item'} {idx + 1}</legend>
						<button
							type="button"
							{disabled}
							onclick={() => {
								simpleObjectArr = simpleObjectArr.filter((_, j) => j !== idx);
								syncJson();
							}}>Remove</button
						>
						<JsonObjectPropertiesEditor
							properties={spec.itemProperties}
							value={item}
							onChange={(nextItem) => {
								const copy = [...simpleObjectArr];
								copy[idx] = nextItem;
								simpleObjectArr = copy;
								syncJson();
							}}
							{disabled}
						/>
					</fieldset>
				{/each}
				<button
					type="button"
					{disabled}
					onclick={() => {
						if (spec.maxItems != null && simpleObjectArr.length >= spec.maxItems) return;
						simpleObjectArr = [...simpleObjectArr, emptyItemFromProperties(spec.itemProperties)];
						syncJson();
					}}>+ Add {spec.itemLabel ?? 'item'}</button
				>
			</div>
		{:else if spec.mode === 'keyValue'}
			<JsonKeyValueEditor
				value={simpleKv}
				onValueChange={(v) => {
					simpleKv = v;
					syncJson();
				}}
				keyPlaceholder={spec.keyPlaceholder}
				valuePlaceholder={spec.valuePlaceholder}
				maxPairs={spec.maxPairs ?? 256}
				{disabled}
			/>
		{/if}
		{#if parseError}<p role="alert">{parseError}</p>{/if}
	{:else}
		<label>
			<span>Raw JSON</span>
			<textarea
				rows="10"
				bind:value={json}
				{disabled}
				oninput={() => {
					parseError = null;
				}}
			></textarea>
		</label>
		{#if parseError}<p role="alert">{parseError}</p>{/if}
	{/if}

	{#if name}
		<input type="hidden" {name} value={json} />
	{/if}
</section>
