/** Trim and validate a sandbox name from route or remote input. */
export function normalizeSandboxName(name: string): string {
	const normalizedName = name.trim();

	if (!normalizedName) {
		throw new Error("Invalid sandbox name");
	}

	return normalizedName;
}
