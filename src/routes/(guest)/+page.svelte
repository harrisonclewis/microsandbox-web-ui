<script lang="ts">
    import { authenticate } from './actions.remote.ts';
</script>

<svelte:head>
    <title>Microsandbox Web UI</title>
</svelte:head>

<style>
    ul[role="alert"] {
        max-width: 24rem;
    }
</style>

<form {...authenticate}>
    {#if authenticate.fields.allIssues()}
        <ul role="alert">
            {#each authenticate.fields.allIssues() ?? [] as issue}
                <li>{issue.message}</li>
            {/each}
        </ul>
    {/if}

    <input {...authenticate.fields.accessToken.as('password')} id="accessToken" />

    <button type="submit" disabled={authenticate.pending > 0}>Authenticate</button>
</form>