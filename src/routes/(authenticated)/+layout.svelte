<script lang="ts">
	import '../../app.css';
	import { logout } from './actions.remote.ts';

	let { children } = $props();
</script>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid black;
    }

    nav ul {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    nav li a, nav li button {
        font-family: serif;
        display: block;
        padding: 0.5rem 1rem;
        text-decoration: none;
        color: black;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.9rem;
    }

    nav li form {
        display: flex;
        height: 100%;
    }

    nav li a:hover, nav li button:hover {
        background: black;
        color: white;
    }
</style>

<nav>
    <ul>
        <li>
            <a href="/dashboard">Dashboard</a>
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
