<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { toCapacity } from "$lib";
	import RemoteState from "$lib/components/remote-state.svelte";
	import Table from "$lib/components/table.svelte";
	import { listSandboxFiles, type SandboxFileEntryRow } from "./data.remote";

	const sandboxName = $derived(page.params.name!);

	const pathQuery = $derived.by(() => {
		const raw = page.url.searchParams.get("path");

		if (raw === null) {
			return undefined;
		}

		const trimmed = raw.trim();

		return trimmed === "" ? undefined : raw;
	});

	const files = $derived(listSandboxFiles({ name: sandboxName, path: pathQuery }));

	function guestBasename(guestPath: string): string {
		const parts = guestPath.split("/").filter((s) => s.length > 0);

		return parts.length > 0 ? parts[parts.length - 1]! : guestPath || "/";
	}

	/** Cumulative paths for each segment after root, e.g. /home/ubuntu → [{name,path:/home},{name,path:/home/ubuntu}]. */
	function guestPathSegments(guestPath: string): Array<{ name: string; path: string }> {
		if (guestPath === "/" || guestPath === "") {
			return [];
		}

		const trimmed = guestPath.replace(/\/+$/, "");
		const parts = trimmed.split("/").filter((s) => s.length > 0);
		const out: Array<{ name: string; path: string }> = [];
		let acc = "";

		for (const part of parts) {
			acc = `${acc}/${part}`;
			out.push({ name: part, path: acc });
		}

		return out;
	}

	function filesBaseHref(): string {
		return resolve(`/sandbox/${encodeURIComponent(sandboxName)}/files`);
	}

	function hrefForGuestPath(guestPath: string): string {
		const base = filesBaseHref();

		if (guestPath === "/") {
			return base;
		}

		return `${base}?path=${encodeURIComponent(guestPath)}`;
	}
</script>

<h2>Files</h2>

<RemoteState remote={files}>
	{#snippet children(remote)}
		{#if remote.current?.data}
			{@const listing = remote.current.data}
			{@const segments = guestPathSegments(listing.path)}

			<p>
				Directory:
				<a href={hrefForGuestPath("/")}>/</a>
				{#each segments as seg, i}
					{#if i > 0}<span>/</span>{/if}
					<a href={hrefForGuestPath(seg.path)}>{seg.name}</a>
				{/each}
			</p>

			{#snippet colName(entry: SandboxFileEntryRow)}
				{#if entry.kind === "directory"}
					<a href={hrefForGuestPath(entry.path)}>{guestBasename(entry.path)}</a>
				{:else}
					{guestBasename(entry.path)}
				{/if}
			{/snippet}

			<Table
				columns={[
					{ label: "Name", key: "path", render: colName },
					{ label: "Type", key: "kind", value: (row) => row.kind },
					{
						label: "Size",
						key: "size",
						value: (row) => toCapacity(row.size, "bytes"),
					},
					{
						label: "Modified",
						key: "modified",
						value: (row) =>
							row.modified != null ? new Date(row.modified).toLocaleString() : "-",
					},
					{
						label: "Mode",
						key: "mode",
						value: (row) => row.mode.toString(8),
					},
				]}
				data={listing.entries}
			/>
		{:else}
			<p>No listing.</p>
		{/if}
	{/snippet}
</RemoteState>
