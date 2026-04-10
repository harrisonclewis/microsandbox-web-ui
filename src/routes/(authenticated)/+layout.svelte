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
            <a href="/activity">Activity</a>
        </li>
        <li>
            <a href="/sandboxes">Sandboxes</a>
        </li>
        <li>
            <a href="/images">Images</a>
        </li>
        <li>
            <a href="/layers">Layers</a>
        </li>
        <li>
            <a href="/snapshots">Snapshots</a>
        </li>
        <li>
            <a href="/volumes">Volumes</a>
        </li>
        <li>
            <a href="/settings/migrations">Migrations</a>
        </li>
        <li>
            <a href="/settings/database">Database</a>
        </li>
        <li>
            <form {...logout}>
                <button type="submit" disabled={logout.pending > 0}>
                    Logout
                </button>
            </form>
        </li>
    </ul>
</nav>

{@render children()}
