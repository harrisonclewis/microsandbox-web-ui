<script lang="ts">
	import { resolve } from "$app/paths";
	import { logout } from "./actions.remote.ts";

	let { children } = $props();
</script>

<nav>
	<ul>
		<li>
			<a href={resolve("/dashboard")}>Dashboard</a>
		</li>
		<li>
			<form {...logout}>
				<button type="submit" disabled={logout.pending > 0}>Logout</button>
			</form>
		</li>
	</ul>
</nav>

{@render children()}
