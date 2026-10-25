import { Room } from "@entities/room.entity.js";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, In, Repository } from "typeorm";
import {
  DEFAULT_SORTING_FIELD,
  DEFAULT_SORTING_ORDER,
  QueryListRoomDto,
  QueryRoomDto,
  ROOM_RESPONSE_FIELDS,
  ROOM_SEARCH_FIELDS,
} from "./room.dto.js";
import { ResponseListDto } from "@common/dto/meta.dto.js";
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
} from "@common/constants/pagination.constants.js";
import { escapeLike } from "@common/utils/like.helper.js";
import { toRangeFilter } from "@common/utils/range.helper.js";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async findOne(id: number, query: QueryRoomDto): Promise<Room | null> {
    const { fields } = query;

    const queryBuilder = this.roomRepository
      .createQueryBuilder("rm")
      .andWhere({ id });

    const select = fields
      ?.filter((field) => ROOM_RESPONSE_FIELDS.includes(field))
      .map((field) => `rm.${field}`);

    if (select?.length) queryBuilder.select(select);

    return await queryBuilder.getOne();
  }

  async findAll(query: QueryListRoomDto): Promise<ResponseListDto<Room>> {
    const {
      fields,
      search,
      searchField,
      sortBy = DEFAULT_SORTING_FIELD,
      sortOrder = DEFAULT_SORTING_ORDER,
      page = PAGE_NUMBER_DEFAULT,
      pageSize = PAGE_SIZE_DEFAULT,
      ...filters
    } = query;

    const queryBuilder = this.roomRepository
      .createQueryBuilder("rm")
      .orderBy(`rm.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const select = fields
      ?.filter((field) => ROOM_RESPONSE_FIELDS.includes(field))
      .map((field) => `rm.${field}`);

    if (select?.length) queryBuilder.select(select);

    if (search) {
      const searchFields = searchField ? [searchField] : ROOM_SEARCH_FIELDS;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          for (const field of searchFields) {
            qb.orWhere(`CAST(rm.${field} AS TEXT) ILIKE :search`);
          }
        }),
        { search: `%${escapeLike(search)}%` },
      );
    }

    if (filters.id?.length) queryBuilder.andWhere({ id: In(filters.id) });
    if (filters.name?.length) queryBuilder.andWhere({ name: In(filters.name) });

    if (filters.accessBy) queryBuilder.andWhere({ accessBy: filters.accessBy });

    const updatedAt = toRangeFilter({ type: 'date', from: filters.updatedAtFrom, to: filters.updatedAtTo });
    const createdAt = toRangeFilter({ type: 'date', from: filters.createdAtFrom, to: filters.createdAtTo });

    if (updatedAt) queryBuilder.andWhere({ updatedAt });
    if (createdAt) queryBuilder.andWhere({ createdAt });

    const [rooms, totalItems] = await queryBuilder.getManyAndCount();

    return {
      items: rooms,
      meta: {
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        hasNextPage: page * pageSize < totalItems,
        hasPrevPage: page > 1,
      },
    };
  }
}
