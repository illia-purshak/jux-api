/**
 * Module DTOs — shape and validation of incoming data (body / query).
 *
 *  - Create<Name>Dto — POST body;
 *  - Update<Name>Dto — PATCH body (all fields optional);
 *  - <Name>QueryDto  — list params: pagination/sorting/search from DefaultQueryParamsDto
 *    (+ `include`/`fields`/`exclude`/`output`, when passed in opts) + the module's own filters;
 *  - <Name>SingleQueryDto — `GET /:id` params: only the response shape params.
 *
 * Allow-lists are exported as constants, so the service uses the same values as validation.
 */

import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  DefaultQueryParamsDto,
  ResponseBodyControlParamsDto,
} from "@dto/query.dto.js";
import { ToEndOfDay } from "@utils/transformers";
import { IsAfterOrEqual } from "@common/validators/is-after-or-equal.decorator.js";
import { IsOptionalNonNullable } from "@common/validators/is-optional-non-nullable.decorator.js";

export const EXAMPLE_FIELDS = [
  "id",
  "name",
  "description",
  "isActive",
  "createdAt",
  "updatedAt",
] as const;
export const EXAMPLE_SORT_FIELDS = ["createdAt", "updatedAt", "name"] as const;
export const EXAMPLE_SEARCH_FIELDS = ["name", "description"] as const;
export const EXAMPLE_DEFAULT_SORT = "createdAt";

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  // Nullable column: `null` clears the value.
  @IsOptional()
  @IsString()
  description?: string | null;

  // NOT NULL column: `null` is rejected instead of failing in the DB.
  @IsOptionalNonNullable()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateExampleDto {
  @IsOptionalNonNullable()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptionalNonNullable()
  @IsBoolean()
  isActive?: boolean;
}

export class ExampleQueryDto extends DefaultQueryParamsDto({
  sortFields: EXAMPLE_SORT_FIELDS,
  searchFields: EXAMPLE_SEARCH_FIELDS,
  defaultSortBy: EXAMPLE_DEFAULT_SORT,
  fields: EXAMPLE_FIELDS,
}) {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdFrom?: Date;

  // A date-only value includes the whole day: `2024-05-17` → `2024-05-17T23:59:59.999Z`.
  @IsOptional()
  @ToEndOfDay()
  @Type(() => Date)
  @IsDate()
  @IsAfterOrEqual("createdFrom")
  createdTo?: Date;
}

export class ExampleSingleQueryDto extends ResponseBodyControlParamsDto({
  fields: EXAMPLE_FIELDS,
}) {}
