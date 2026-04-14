<script lang="ts">
	type Row = { key: string; value: string };

	let {
		value,
		onValueChange,
		keyPlaceholder = 'name',
		valuePlaceholder = 'value',
		maxPairs = 256,
		disabled = false
	}: {
		value: Record<string, string>;
		onValueChange: (next: Record<string, string>) => void;
		keyPlaceholder?: string;
		valuePlaceholder?: string;
		maxPairs?: number;
		disabled?: boolean;
	} = $props();

	function recordToRows(rec: Record<string, string>): Row[] {
		const keys = Object.keys(rec).filter((k) => k.trim() !== '');
		const data = keys.map((k) => ({ key: k, value: rec[k] ?? '' }));
		const withTrailing: Row[] = [...data, { key: '', value: '' }];
		return withTrailing.slice(0, maxPairs);
	}

	let rows = $state<Row[]>([{ key: '', value: '' }]);
	let syncingFromChild = false;

	function buildRecord(): Record<string, string> {
		const out: Record<string, string> = {};
		for (const r of rows) {
			const k = r.key.trim();
			if (k) out[k] = r.value;
		}
		return out;
	}

	function emit() {
		syncingFromChild = true;
		onValueChange(buildRecord());
		queueMicrotask(() => {
			syncingFromChild = false;
		});
	}

	$effect.pre(() => {
		if (syncingFromChild) return;
		rows = recordToRows(value);
	});

	function addRow() {
		if (rows.length >= maxPairs) return;
		rows = [...rows, { key: '', value: '' }];
	}

	function removeRow(i: number) {
		rows = rows.filter((_, j) => j !== i);
		if (rows.length === 0) rows = [{ key: '', value: '' }];
		emit();
	}
</script>

<table>
	<thead>
		<tr>
			<th scope="col">Name</th>
			<th scope="col">Value</th>
			<th scope="col">Remove</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row, i (i)}
			<tr>
				<td>
					<input
						type="text"
						placeholder={keyPlaceholder}
						bind:value={row.key}
						{disabled}
						oninput={() => emit()}
					/>
				</td>
				<td>
					<input
						type="text"
						placeholder={valuePlaceholder}
						bind:value={row.value}
						{disabled}
						oninput={() => emit()}
					/>
				</td>
				<td>
					<button type="button" {disabled} onclick={() => removeRow(i)} aria-label="Remove row">✕</button>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
<p><button type="button" {disabled} onclick={addRow}>+ Add</button></p>
