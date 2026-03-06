export interface GenericQueryParamsInterface {
  search?: string;
  page?: number;
  limit?: number;
  fields?: string;
  startDate?: string;
  endDate?: string;
  sort?: "asc" | "desc";
}

export interface IQueryParams extends GenericQueryParamsInterface {
  status?: string;

  [key: string]: unknown;
}
