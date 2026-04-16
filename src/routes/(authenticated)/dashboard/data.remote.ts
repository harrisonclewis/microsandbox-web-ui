import { query } from "$app/server";
import { getMsb } from "$lib/server/microsandbox";
import { toSandboxInfoWithConfig } from "$lib/types";

export const getSandboxes = query(async () => {
    const sandboxes = await getMsb()?.Sandbox.list() ?? [];

    return {
        data: sandboxes.map(toSandboxInfoWithConfig)
    };
});