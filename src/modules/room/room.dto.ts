import { DefaultQueryParamsDto, ResponseBodyControlParamsDto } from "@common/dto/query.dto.js";
import { RoomAccessByEnum } from "@entities/room.entity.js";
import { OmitType, PartialType } from "@nestjs/swagger";
import { IsDate, IsEnum, IsInt, IsString, MaxLength } from "class-validator";

export const ROOM_RESPONSE_FIELDS = ['id', 'name', 'accessBy', 'updatedAt', 'createdAt'];
export const ROOM_SORT_FIELDS = ['id', 'name', 'accessBy', 'updatedAt', 'createdAt'];
export const ROOM_SEARCH_FIELDS = ['id', 'name', 'accessBy', 'updatedAt', 'createdAt'];
export const DEFAULT_SORTING_FIELD = 'createdAt';
export const DEFAULT_SORTING_ORDER = 'DESC';

export class RoomDto {
  @IsInt()
  id: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(RoomAccessByEnum)
  accessBy: RoomAccessByEnum;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  createdAt: Date;
}

export class CreateRoomDto extends OmitType(RoomDto, ['id', 'updatedAt', 'createdAt']) {}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class QueryListRoomDto extends DefaultQueryParamsDto({
  sortFields: ROOM_SORT_FIELDS,
  searchFields: ROOM_SEARCH_FIELDS,
  defaultSortBy: DEFAULT_SORTING_FIELD,
  fields: ROOM_RESPONSE_FIELDS,
}) {}

export class QueryRoomDto extends ResponseBodyControlParamsDto({
  fields: ROOM_RESPONSE_FIELDS,
}) {}
