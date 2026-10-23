/**
 * Module service — all business logic and DB access.
 * The controller only accepts the request and calls service methods.
 */

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  Repository,
} from "typeorm";
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
} from "@constants/pagination.constants.js";
import { ResponseListDto } from "@dto/meta.dto.js";
import { escapeLike } from "@utils/like.helper.js";
import { toRangeFilter } from "@utils/range.helper.js";
import { ExampleEntity } from "@entities/example.entity.js";
import {
  CreateExampleDto,
  EXAMPLE_DEFAULT_SORT,
  EXAMPLE_SEARCH_FIELDS,
  ExampleQueryDto,
  ExampleSingleQueryDto,
  UpdateExampleDto,
} from "./dto/example.dto.js";

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async findAll(
    query: ExampleQueryDto,
  ): Promise<ResponseListDto<ExampleEntity>> {
    const {
      page = PAGE_NUMBER_DEFAULT,
      pageSize = PAGE_SIZE_DEFAULT,
      sortBy = EXAMPLE_DEFAULT_SORT,
      sortOrder,
      search,
      searchField,
      fields,
    } = query;

    // TypeORM 1.x throws on `undefined` in `where` (`invalidWhereValuesBehavior` defaults to "throw"),
    // so optional filters are added only when they are set.
    const baseWhere: FindOptionsWhere<ExampleEntity> = {};
    const createdAt = toRangeFilter(query.createdFrom, query.createdTo);
    if (createdAt) baseWhere.createdAt = createdAt;

    // Without searchField, search across all allowed fields (OR).
    const searchFields = searchField ? [searchField] : EXAMPLE_SEARCH_FIELDS;
    const where = search
      ? searchFields.map((field) => ({
          ...baseWhere,
          [field]: ILike(`%${escapeLike(search)}%`),
        }))
      : baseWhere;

    const [items, totalItems] = await this.exampleRepository.findAndCount({
      where,
      select: this.toSelect(fields),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      meta: {
        pageSize,
        currentPage: page,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      items,
    };
  }

  async findOne(
    id: number,
    query: ExampleSingleQueryDto = {},
  ): Promise<ExampleEntity> {
    const example = await this.exampleRepository.findOne({
      where: { id },
      select: this.toSelect(query.fields),
    });
    if (!example) throw new NotFoundException(`Example ${id} not found`);
    return example;
  }

  create(dto: CreateExampleDto): Promise<ExampleEntity> {
    return this.exampleRepository.save(this.exampleRepository.create(dto));
  }

  async update(id: number, dto: UpdateExampleDto): Promise<ExampleEntity> {
    const example = await this.findOne(id);
    return this.exampleRepository.save(
      this.exampleRepository.merge(example, dto),
    );
  }

  async remove(id: number): Promise<void> {
    const example = await this.findOne(id);
    await this.exampleRepository.remove(example);
  }

  // `fields` → SELECT only the requested columns (all columns when not set).
  private toSelect(
    fields?: (keyof ExampleEntity)[],
  ): FindOptionsSelect<ExampleEntity> | undefined {
    return fields?.length
      ? Object.fromEntries(fields.map((field) => [field, true]))
      : undefined;
  }
}
