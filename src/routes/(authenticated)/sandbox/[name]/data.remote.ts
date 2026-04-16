import { query } from "$app/server";
import { getMsb } from "$lib/server/microsandbox";
import { toSandboxInfoWithConfig } from "$lib/types";
import * as v from "valibot";

export const getSandbox = query(v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)), async (name) => {
	const normalizedName = name.trim();

	if (!normalizedName) {
		return { data: null };
	}

	const msb = getMsb();

	if (!msb) {
		return { data: null };
	}

	const sandbox = (await msb.Sandbox.list()).find((item) => item.name === normalizedName) ?? null;

	return {
		data: sandbox ? toSandboxInfoWithConfig(sandbox) : null,
	};
});
