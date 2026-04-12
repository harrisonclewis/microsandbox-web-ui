import { asc, count, desc, type SQLWrapper } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { getPageParamName, getSortParamName, parseSortToken, type SortDirection } from '$lib/pagination/queryParams';

export const PAGE_SIZE = 25;

export type PaginationRequest = {
	namespace: string;
	page: number;
	pageSize: number;
};

export type PaginationMeta = {
	page: number;
	pageSize: number;
	totalRows: number;
	totalPages: number;
};

export type PaginatedResult<T> = PaginationMeta & {
	sortBy: string;
	sortDir: SortDirection;
	defaultSortBy: string;
	defaultSortDir: SortDirection;
	data: T[];
};

type PaginationOptions<TSorts extends Record<string, SQLWrapper>> = {
	namespace: string;
	query: any;
	sorts: TSorts;
	defaultSortBy: keyof TSorts & string;
	defaultSortDir?: SortDirection;
	tieBreaker?: SQLWrapper;
	countQuery?: () => Promise<number>;
};

type ArrayPaginationOptions<TItem, TSortBy extends string> = {
	namespace: string;
	data: TItem[];
	allowedSortKeys: readonly TSortBy[];
	defaultSortBy: TSortBy;
	defaultSortDir?: SortDirection;
	sorter: (left: TItem, right: TItem, sortBy: TSortBy, sortDir: SortDirection) => number;
};

export class Pagination {
	static async fromSearchParams<TSorts extends Record<string, SQLWrapper>>(
		searchParams: URLSearchParams,
		options: PaginationOptions<TSorts>
	): Promise<PaginatedResult<any>> {
		const paginationRequest = parsePaginationRequest(searchParams, options.namespace);
		const sortKeys = Object.keys(options.sorts) as Array<keyof TSorts & string>;
		const defaultSortDir = options.defaultSortDir ?? 'asc';
		const { sortBy, sortDir } = parseSortRequest(
			searchParams,
			options.namespace,
			sortKeys,
			options.defaultSortBy,
			defaultSortDir
		);

		const totalRows = options.countQuery
			? await options.countQuery()
			: await Pagination.autoCount(options.query);
		const pagination = buildPaginationMeta(paginationRequest, totalRows);
		const { limit, offset } = getPaginationWindow(pagination);
		const data = await options.query
			.orderBy(
				orderByDirection(options.sorts[sortBy], sortDir),
				...(options.tieBreaker ? [orderByDirection(options.tieBreaker, sortDir)] : [])
			)
			.limit(limit)
			.offset(offset);

		return {
			...pagination,
			sortBy,
			sortDir,
			defaultSortBy: options.defaultSortBy,
			defaultSortDir,
			data
		};
	}

	private static async autoCount(query: any): Promise<number> {
		const subquery = query.as('pagination_rows');
		const countRows = await db.select({ value: count() }).from(subquery);
		return countRows[0]?.value ?? 0;
	}

	static fromArray<TItem, TSortBy extends string>(
		searchParams: URLSearchParams,
		options: ArrayPaginationOptions<TItem, TSortBy>
	): PaginatedResult<TItem> {
		const paginationRequest = parsePaginationRequest(searchParams, options.namespace);
		const defaultSortDir = options.defaultSortDir ?? 'asc';
		const { sortBy, sortDir } = parseSortRequest(
			searchParams,
			options.namespace,
			options.allowedSortKeys,
			options.defaultSortBy,
			defaultSortDir
		);

		const sortedRows = [...options.data].sort((left, right) =>
			options.sorter(left, right, sortBy, sortDir)
		);
		const pagination = buildPaginationMeta(paginationRequest, sortedRows.length);
		const { limit, offset } = getPaginationWindow(pagination);

		return {
			...pagination,
			sortBy,
			sortDir,
			defaultSortBy: options.defaultSortBy,
			defaultSortDir,
			data: sortedRows.slice(offset, offset + limit)
		};
	}
}

export function parsePaginationRequest(
	searchParams: URLSearchParams,
	namespace: string
): PaginationRequest {
	const pageParam = getPageParamName(namespace);
	const parsedPage = Number.parseInt(searchParams.get(pageParam) ?? '1', 10);
	const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

	return {
		namespace,
		page,
		pageSize: PAGE_SIZE
	};
}

export function buildPaginationMeta(request: PaginationRequest, totalRows: number): PaginationMeta {
	const boundedTotalRows = Math.max(0, totalRows);
	const totalPages = Math.max(1, Math.ceil(boundedTotalRows / request.pageSize));
	const page = Math.min(request.page, totalPages);

	return {
		page,
		pageSize: request.pageSize,
		totalRows: boundedTotalRows,
		totalPages
	};
}

export function getPaginationWindow(meta: PaginationMeta): { limit: number; offset: number } {
	return {
		limit: meta.pageSize,
		offset: (meta.page - 1) * meta.pageSize
	};
}

export function parseSortRequest<TSortBy extends string>(
	searchParams: URLSearchParams,
	namespace: string,
	allowedSortKeys: readonly TSortBy[],
	defaultSortBy: TSortBy,
	defaultSortDir: SortDirection = 'asc'
): { sortBy: TSortBy; sortDir: SortDirection } {
	const sortParam = getSortParamName(namespace);
	const parsedSort = parseSortToken(searchParams.get(sortParam));
	const requestedSortBy = parsedSort?.sortBy;
	const requestedSortDir = parsedSort?.sortDir;

	const sortBy = allowedSortKeys.includes(requestedSortBy as TSortBy)
		? (requestedSortBy as TSortBy)
		: defaultSortBy;
	const sortDir: SortDirection =
		requestedSortDir === 'asc' || requestedSortDir === 'desc' ? requestedSortDir : defaultSortDir;

	return { sortBy, sortDir };
}

export function orderByDirection(column: SQLWrapper, sortDir: SortDirection) {
	return sortDir === 'desc' ? desc(column) : asc(column);
}
