<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type TableColumn<TRow extends object> = {
		label: string;
		key: string;
		value?: (item: TRow) => unknown;
		render?: Snippet<[item: TRow]>;
	};
</script>

<script lang="ts" generics="T extends object">
	let { data, columns }: { data: T[]; columns: TableColumn<T>[] } = $props();

	function getValue(item: T, keyPath: string): unknown {
		const keys = keyPath.split(".");
		let current: unknown = item;

		for (const key of keys) {
			if (current == null || typeof current !== "object") return "";
			current = (current as Record<string, unknown>)[key];
		}

		return current ?? "";
	}
</script>

<table>
	<thead>
		<tr>
			{#each columns as column}
				<th>{column.label}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each data as item}
			<tr>
				{#each columns as column}
					<td>
						{#if column.render}
							{@render column.render(item)}
						{:else}
							{column.value ? column.value(item) : getValue(item, column.key)}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>