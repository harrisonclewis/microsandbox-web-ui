<script lang="ts">
    let { data, columns }: { data: any[], columns: { label: string, key: string }[] } = $props();
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
                    <td>{item[column.key]}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>