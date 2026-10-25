import { DefaultQueryParamsDto, ResponseBodyControlParamsDto, SortOrder } from "@common/dto/query.dto.js";
import { ToNumberArray, ToStringArray } from "@common/utils/transformers/array.transformers.js";
import { ToEndOfDay } from "@common/utils/transformers/date.transformers.js";
import { RoomAccessByEnum } from "@entities/room.entity.js";
import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export const ROOM_RESPONSE_FIELDS = ['id', 'name', 'accessBy', 'updatedAt', 'createdAt'];
export const ROOM_SORT_FIELDS = ['id', 'name', 'accessBy', 'updatedAt', 'createdAt'];
export const ROOM_SEARCH_FIELDS = ['id', 'name', 'accessBy', 'updatedAt', 'createdAt'];
export const DEFAULT_SORTING_FIELD = 'createdAt';
export const DEFAULT_SORTING_ORDER = SortOrder.DESC;

export class RoomDto {
  @IsInt()
  @Type(() => Number)
  id: number;

  @IsString()
  @MaxLength(255)
  @Type(() => String)
  name: string;

  @IsEnum(RoomAccessByEnum)
  accessBy: RoomAccessByEnum;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}

export class CreateRoomDto extends OmitType(RoomDto, ['id', 'updatedAt', 'createdAt']) {}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class QueryListRoomDto extends DefaultQueryParamsDto({
  sortFields: ROOM_SORT_FIELDS,
  searchFields: ROOM_SEARCH_FIELDS,
  defaultSortBy: DEFAULT_SORTING_FIELD,
  fields: ROOM_RESPONSE_FIELDS,
}) {
  @ApiPropertyOptional({ type: [Number], description: "Room ids: `1,2` or `id=1&id=2`" })
  @IsOptional()
  @ToNumberArray()
  @IsArray()
  @IsInt({ each: true })
  id?: number[];

  @ApiPropertyOptional({
    type: [String],
    description: "Exact room names, repeat the param for several: `name=a&name=b`",
  })
  @IsOptional()
  @ToStringArray({ separator: false })
  @IsArray()
  @IsString({ each: true })
  name?: string[];

  @ApiPropertyOptional({ enum: RoomAccessByEnum })
  @IsOptional()
  @IsEnum(RoomAccessByEnum)
  accessBy?: RoomAccessByEnum;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    description: "Lower bound, inclusive: `2024-05-01` or ISO 8601",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAtFrom?: Date;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    description: "Upper bound: `2024-05-17` (up to the end of that day, UTC) or ISO 8601",
  })
  @IsOptional()
  @IsDate()
  @ToEndOfDay()
  @Type(() => Date)
  updatedAtTo?: Date;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    description: "Lower bound, inclusive: `2024-05-01` or ISO 8601",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAtFrom?: Date;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    description: "Upper bound: `2024-05-17` (up to the end of that day, UTC) or ISO 8601",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ToEndOfDay()
  createdAtTo?: Date;
}

export class QueryRoomDto extends ResponseBodyControlParamsDto({
  fields: ROOM_RESPONSE_FIELDS,
}) {}
