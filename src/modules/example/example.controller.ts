/**
 * Module controller — HTTP layer only: routes, params, status codes.
 * No business logic — delegate everything to the service.
 * Body/query validation is done by the global ValidationPipe using DTOs.
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiPaginatedResponse } from "@common/decorators/api-paginated-response.decorator.js";
import { ExampleEntity } from "@entities/example.entity.js";
import {
  CreateExampleDto,
  ExampleQueryDto,
  ExampleSingleQueryDto,
  UpdateExampleDto,
} from "./dto/example.dto.js";
import { ExampleService } from "./example.service.js";

@ApiTags("examples")
@Controller("examples")
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @ApiPaginatedResponse(ExampleEntity)
  findAll(@Query() query: ExampleQueryDto) {
    return this.exampleService.findAll(query);
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @Query() query: ExampleSingleQueryDto,
  ) {
    return this.exampleService.findOne(id, query);
  }

  @Post()
  create(@Body() dto: CreateExampleDto) {
    return this.exampleService.create(dto);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateExampleDto,
  ) {
    return this.exampleService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.exampleService.remove(id);
  }
}
