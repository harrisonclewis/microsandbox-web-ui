import { z } from 'zod';

/** Result of validating a JSON string from the DB against a Zod schema. */
export type ParseDbJsonSuccess<S extends z.ZodTypeAny> = {
	success: true;
	data: z.infer<S>;
};

export type ParseDbJsonFailure = {
	success: false;
	error: z.ZodError | Error;
};

export type ParseDbJsonResult<S extends z.ZodTypeAny> =
	| ParseDbJsonSuccess<S>
	| ParseDbJsonFailure;

/** Use when spreading a row: `{ ...row, someColumn: DbJson.column(schema, row.someColumn) }`. */
export type DbJsonColumn<T> = {
	raw: string;
	data: T | null;
	error: string | null;
};

function formatZodError(err: z.ZodError): string {
	return err.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

/**
 * Parse a DB text column as JSON, then validate with `schema.safeParse`.
 * Use `DbJson.column` when you want `{ raw, data, error }` for spreads.
 */
export function parseDbJson<S extends z.ZodTypeAny>(
	schema: S,
	raw: string
): ParseDbJsonResult<S> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch (e) {
		return {
			success: false,
			error: e instanceof Error ? e : new Error('Invalid JSON')
		};
	}
	const result = schema.safeParse(parsed);
	return result.success
		? { success: true, data: result.data }
		: { success: false, error: result.error };
}

export function parseDbJsonErrorMessage(result: ParseDbJsonFailure): string {
	return result.error instanceof z.ZodError
		? formatZodError(result.error)
		: result.error.message;
}

/**
 * Structured JSON column for database rows: keeps original text, validated `data`, or `error` message.
 *
 * @example
 * ```ts
 * return {
 *   ...sandbox,
 *   config: DbJson.column(sandboxEngineConfigSchema, sandbox.config)
 * };
 * ```
 */
export function dbJsonColumn<S extends z.ZodTypeAny>(
	schema: S,
	raw: string
): DbJsonColumn<z.infer<S>> {
	const result = parseDbJson(schema, raw);
	if (result.success) {
		return { raw, data: result.data, error: null };
	}
	return { raw, data: null, error: parseDbJsonErrorMessage(result) };
}

/** {@link parseDbJson} {@link dbJsonColumn} {@link parseDbJsonErrorMessage} */
export const DbJson = {
	parse: parseDbJson,
	column: dbJsonColumn,
	errorMessage: parseDbJsonErrorMessage
} as const;
