import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { CreateRoomDto, QueryListRoomDto, QueryRoomDto, UpdateRoomDto } from './room.dto.js';
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

  @Post(':userId')
  async create(
    @Body() dto: CreateRoomDto,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Room> {
    return await this.roomService.create(dto, userId);
  }

  @Patch(':userId/:roomId')
  async update(
    @Body() dto: UpdateRoomDto,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<Room> {
    return await this.roomService.update(dto, userId, roomId);
  }

  @Delete(':userId/:roomId')
  async delete(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<Room> {
    return await this.roomService.delete(userId, roomId);
  }
}
