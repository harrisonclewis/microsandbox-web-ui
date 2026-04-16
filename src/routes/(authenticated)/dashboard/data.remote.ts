import { query } from "$app/server";
import { msb } from "$lib/server/microsandbox";
import { toSandboxInfoWithConfig } from "$lib/types";

export const getSandboxes = query(async () => {
    const sandboxes = await msb().Sandbox.list();

    return {
        data: sandboxes.map(toSandboxInfoWithConfig)
    };
});