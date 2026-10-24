import { Controller, Get, Query } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { QueryListRoomDto } from './room.dto.js';
import { Room } from '@entities/room.entity.js';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':id')
  async findOne(id: number, @Query() query: QueryListRoomDto): Promise<Room | null> {
    return this.roomService.findOne(id, query);
  }
}
