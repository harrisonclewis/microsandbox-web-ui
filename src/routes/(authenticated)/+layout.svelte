<script lang="ts">
	import { logout } from './actions.remote.ts';

	let { children } = $props();
</script>

<nav>
	<ul>
		<li>
			<a href="/dashboard">Dashboard</a>
		</li>
		<li>
			<form {...logout}>
				<button type="submit" disabled={logout.pending > 0}>Logout</button>
			</form>
		</li>
	</ul>
</nav>

{@render children()}
