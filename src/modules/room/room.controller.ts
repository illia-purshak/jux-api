import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { QueryListRoomDto, QueryRoomDto } from './room.dto.js';
import { Room } from '@entities/room.entity.js';
import { ResponseListDto } from '@common/dto/meta.dto.js';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryRoomDto,
  ): Promise<Room | null> {
    return this.roomService.findOne(id, query);
  }

  @Get()
  async findAll(@Query() query: QueryListRoomDto): Promise<ResponseListDto<Room>> {
    return await this.roomService.findAll(query);
  }
}
