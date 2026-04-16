<script lang="ts">
	import { clearToast, ToastType, toasts } from "$lib/client/toasts";
</script>

{#if $toasts.length > 0}
	<section aria-label="Notifications">
		<ul>
			{#each $toasts as entry (entry.id)}
				<li>
					<p role={entry.type === ToastType.Error ? "alert" : "status"}>{entry.message}</p>
					<p>
						<button type="button" onclick={() => clearToast(entry)}>Dismiss</button>
					</p>
				</li>
			{/each}
		</ul>
	</section>
{/if}
