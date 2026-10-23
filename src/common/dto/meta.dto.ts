/**
 * Response DTOs shared by all modules.
 *
 * Every list endpoint returns `ResponseListDto<T>`: `{ meta, items }`.
 * Document it in Swagger with `@ApiPaginatedResponse(Model)` from `@common/decorators`.
 */

import { ApiProperty } from "@nestjs/swagger";

/** Pagination info of a list response. */
export class MetaDto {
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Paginated list response: one page of `items` plus pagination `meta`. */
export class ResponseListDto<T> {
  meta: MetaDto;

  // Swagger can't infer a generic `T[]`; the concrete item type comes from `@ApiPaginatedResponse(Model)`.
  @ApiProperty({ type: "array", items: { type: "object" } })
  items: T[];
}
