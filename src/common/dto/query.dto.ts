/**
 * Query DTOs shared by all modules (`src/common/dto` holds DTOs that are not tied to one module).
 * Module-specific DTOs extend these factories: `class XQueryDto extends DefaultQueryParamsDto({...}) {}`.
 */

import { Type } from "@nestjs/common";
import { ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { Transform, Type as TransformType } from "class-transformer";
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
} from "@constants/pagination.constants.js";
import { ToStringArray } from "@utils/transformers";

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

/**
 * Response shape params, each enabled only when its allow-list is passed in `opts`:
 *  - `include` — relations to join;
 *  - `fields`  — columns to select;
 *  - `exclude` — relations/fields to leave out;
 *  - `output`  — output formats.
 * Standalone, so it fits `GET /:id`, where pagination/sorting/search make no sense.
 *
 * Params that are not configured are not whitelisted at all, so the global
 * ValidationPipe (forbidNonWhitelisted) rejects them. They are typed as `never[]`.
 */
export function ResponseBodyControlParamsDto<
  const includeRelations extends string = never,
  const includeFields extends string = never,
  const excludeRelations extends string = never,
  const outputFormat extends string = never,
>(
  opts: {
    include?: readonly includeRelations[];
    fields?: readonly includeFields[];
    exclude?: readonly excludeRelations[];
    output?: readonly outputFormat[];
  } = {},
) {
  class IncludeParamsDto {
    @ApiPropertyOptional({ type: [String], enum: opts.include })
    @IsOptional()
    @ToStringArray()
    @IsArray()
    @IsIn(opts.include ?? [], { each: true })
    include?: includeRelations[];
  }

  class FieldsParamsDto {
    @ApiPropertyOptional({ type: [String], enum: opts.fields })
    @IsOptional()
    @ToStringArray()
    @IsArray()
    @IsIn(opts.fields ?? [], { each: true })
    fields?: includeFields[];
  }

  class ExcludeParamsDto {
    @ApiPropertyOptional({ type: [String], enum: opts.exclude })
    @IsOptional()
    @ToStringArray()
    @IsArray()
    @IsIn(opts.exclude ?? [], { each: true })
    exclude?: excludeRelations[];
  }

  class OutputParamsDto {
    @ApiPropertyOptional({ type: [String], enum: opts.output })
    @IsOptional()
    @ToStringArray()
    @IsArray()
    @IsIn(opts.output ?? [], { each: true })
    output?: outputFormat[];
  }

  class EmptyParamsDto {}
  type Result = IncludeParamsDto &
    FieldsParamsDto &
    ExcludeParamsDto &
    OutputParamsDto;

  // Only the configured params become part of the DTO.
  const params: [boolean, Type<unknown>][] = [
    [Boolean(opts.include), IncludeParamsDto],
    [Boolean(opts.fields), FieldsParamsDto],
    [Boolean(opts.exclude), ExcludeParamsDto],
    [Boolean(opts.output), OutputParamsDto],
  ];

  const combined = params
    .filter(([isEnabled]) => isEnabled)
    .reduce<Type<unknown>>(
      (acc, [, dto]) => IntersectionType(acc, dto),
      EmptyParamsDto,
    );
  return combined as Type<Result>;
}

/**
 * List endpoint params: pagination, sorting, search
 * (+ `include`/`fields`/`exclude`/`output` from ResponseBodyControlParamsDto when configured).
 */
export function DefaultQueryParamsDto<
  const sortFields extends string = never,
  const searchFields extends string = never,
  const includeRelations extends string = never,
  const includeFields extends string = never,
  const excludeRelations extends string = never,
  const outputFormat extends string = never,
>(
  opts: {
    sortFields?: readonly sortFields[];
    searchFields?: readonly searchFields[];
    defaultSortBy?: NoInfer<sortFields>;
    include?: readonly includeRelations[];
    fields?: readonly includeFields[];
    exclude?: readonly excludeRelations[];
    output?: readonly outputFormat[];
  } = {},
) {
  const allowedSearchFields = opts.searchFields ?? [];
  const allowedSortFields = opts.sortFields ?? [];

  class QueryParamsDto {
    @ApiPropertyOptional({ enum: allowedSearchFields })
    @IsOptional()
    @IsIn(allowedSearchFields)
    searchField?: searchFields;

    @ApiPropertyOptional({ minLength: 3, maxLength: 100 })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    search?: string;

    @ApiPropertyOptional({
      enum: allowedSortFields,
      default: opts.defaultSortBy,
    })
    @IsOptional()
    @IsIn(allowedSortFields)
    sortBy?: sortFields = opts.defaultSortBy;

    @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
    @IsOptional()
    @Transform(({ value }) => String(value).toUpperCase())
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({ minimum: 1, default: PAGE_NUMBER_DEFAULT })
    @IsOptional()
    @TransformType(() => Number)
    @IsInt()
    @Min(1)
    page?: number = PAGE_NUMBER_DEFAULT;

    @ApiPropertyOptional({
      minimum: 1,
      maximum: PAGE_SIZE_MAX,
      default: PAGE_SIZE_DEFAULT,
    })
    @IsOptional()
    @TransformType(() => Number)
    @IsInt()
    @Min(1)
    @Max(PAGE_SIZE_MAX)
    pageSize?: number = PAGE_SIZE_DEFAULT;
  }

  return IntersectionType(
    QueryParamsDto,
    ResponseBodyControlParamsDto({
      include: opts.include,
      fields: opts.fields,
      exclude: opts.exclude,
      output: opts.output,
    }),
  );
}
