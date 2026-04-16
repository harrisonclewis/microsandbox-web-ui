<script lang="ts">
    import { authenticate } from './actions.remote.ts';
</script>

<form {...authenticate}>
    <h2>Login</h2>
    {#if authenticate.fields.allIssues()}
        <ul role="alert">
            {#each authenticate.fields.allIssues() ?? [] as issue}
                <li>{issue.message}</li>
            {/each}
        </ul>
    {/if}

    <label for="accessToken">Access token</label>
    <input {...authenticate.fields.accessToken.as('password')} id="accessToken" />

    <button type="submit" disabled={authenticate.pending > 0}>Authenticate</button>
</form>