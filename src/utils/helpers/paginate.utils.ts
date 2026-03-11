/* eslint-disable */
type PrismaDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
};

type PaginateOptions = {
  delegate: PrismaDelegate;
  where?: Record<string, any>;
  page?: number;
  limit?: number;
  orderBy?: Record<string, any> | Array<Record<string, any>>;
  select?: Record<string, any>;
  include?: Record<string, any>;
  excludeById?: string | null;
  excludeField?: string;
  countWhere?: Record<string, any>;
};

export type PaginateResult<T> = {
  documents: T[];
  pagination: {
    totalCount: number;
    filteredCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
};

export const paginate = async <T>({
  delegate,
  where = {},
  page = 1,
  limit = 10,
  orderBy = { createdAt: "desc" },
  select,
  include,
  excludeById = null,
  excludeField = "id",
  countWhere,
}: PaginateOptions): Promise<PaginateResult<T>> => {
  const safePage = Number.isFinite(Number(page))
    ? Math.max(1, Number(page))
    : 1;
  const safeLimit = Number.isFinite(Number(limit))
    ? Math.max(1, Number(limit))
    : 10;

  const skip = (safePage - 1) * safeLimit;

  const finalWhere =
    excludeById === null
      ? where
      : {
          AND: [where, { NOT: { [excludeField]: excludeById } }],
        };

  const [documents, totalCount, filteredCount] = await Promise.all([
    delegate.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take: safeLimit,
      ...(select ? { select } : {}),
      ...(include ? { include } : {}),
    }),
    delegate.count({ where: countWhere ?? {} }),
    delegate.count({ where: finalWhere }),
  ]);

  const totalPages = Math.ceil(filteredCount / safeLimit);

  return {
    documents: documents as T[],
    pagination: {
      totalCount,
      filteredCount,
      totalPages,
      page: safePage,
      limit: safeLimit,
    },
  };
};
