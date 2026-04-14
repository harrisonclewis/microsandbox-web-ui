<script lang="ts">
	type Mode = 'simple' | 'advanced';

	let {
		mode = $bindable('simple' satisfies Mode),
		simpleLabel = 'Simple',
		advancedLabel = 'Advanced',
		onModeChange
	}: {
		mode?: Mode;
		simpleLabel?: string;
		advancedLabel?: string;
		onModeChange?: (m: Mode) => void;
	} = $props();

	function pick(next: Mode) {
		mode = next;
		onModeChange?.(next);
	}
</script>

<div role="group" aria-label="Edit mode">
	<button type="button" aria-pressed={mode === 'simple'} onclick={() => pick('simple')}>{simpleLabel}</button>
	<button type="button" aria-pressed={mode === 'advanced'} onclick={() => pick('advanced')}>{advancedLabel}</button>
</div>
