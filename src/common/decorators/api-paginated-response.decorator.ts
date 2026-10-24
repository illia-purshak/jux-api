/**
 * Reusable Nest/Swagger decorators shared across controllers.
 * One decorator per file, named `<name>.decorator.ts`.
 */

import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { ResponseListDto } from "@dto/meta.dto.js";

/**
 * Documents a paginated list response in Swagger: `{ meta: MetaDto, items: Model[] }`.
 * Needed because Swagger can't describe the generic `ResponseListDto<T>` on its own.
 *
 * Usage: `@ApiPaginatedResponse(Room) @Get() findAll() {...}`
 */
export function ApiPaginatedResponse(model: Type<unknown>) {
  return applyDecorators(
    ApiExtraModels(ResponseListDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseListDto) },
          {
            properties: {
              items: { type: "array", items: { $ref: getSchemaPath(model) } },
            },
          },
        ],
      },
    }),
  );
}
