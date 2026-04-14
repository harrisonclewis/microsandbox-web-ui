import { form } from '$app/server';
import * as v from 'valibot';
import { redirect, invalid } from '@sveltejs/kit';
import { assertSdkResult } from '$lib/server/microsandbox/action-redirect.js';
import { sdkVolumeCreate, sdkVolumeRemove } from '$lib/server/microsandbox/service.js';
import {
	formatValibotIssues,
	parseJsonString,
	volumeLabelsSchema
} from '$lib/server/microsandbox/json-validators.js';

const volumeNameSchema = v.pipe(
	v.string(),
	v.nonEmpty(),
	v.maxLength(256),
	v.regex(/^[a-zA-Z0-9._-]+$/)
);

export const volumeCreate = form(
	v.object({
		name: volumeNameSchema,
		quotaMib: v.optional(
			v.pipe(
				v.string(),
				v.transform((s) => (s.trim() === '' ? undefined : Number(s))),
				v.union([v.undefined(), v.pipe(v.number(), v.finite(), v.minValue(1))])
			)
		),
		labelsJson: v.optional(v.string())
	}),
	async ({ name, quotaMib, labelsJson }) => {
		let labels: Record<string, string> | undefined;
		if (labelsJson?.trim()) {
			let parsed: unknown;
			try {
				parsed = parseJsonString(labelsJson);
			} catch (e) {
				invalid(e instanceof Error ? e.message : 'labelsJson must be valid JSON.');
			}
			const result = v.safeParse(volumeLabelsSchema, parsed);
			if (!result.success) {
				invalid(`labelsJson: ${formatValibotIssues(result.issues)}`);
			}
			labels = result.output;
		}
		const result = await sdkVolumeCreate({
			name,
			...(quotaMib != null ? { quotaMib } : {}),
			...(labels && Object.keys(labels).length ? { labels } : {})
		});
		assertSdkResult(result);
		throw redirect(303, `/volumes?volumeCreated=${encodeURIComponent(result.data.name)}`);
	}
);

export const volumeRemove = form(
	v.object({
		name: volumeNameSchema,
		confirm: v.literal('REMOVE_VOLUME')
	}),
	async ({ name }) => {
		const result = await sdkVolumeRemove(name);
		assertSdkResult(result);
		throw redirect(303, '/volumes?volumeRemoved=1');
	}
);
