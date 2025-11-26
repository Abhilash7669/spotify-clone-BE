export type PaginatedResult<T> = {
  data: Array<T>;
  count: number;
  page: number;
  pages: number;
  itemsPerPage: number;
};
