import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { CreateRoomDto, QueryListRoomDto, QueryRoomDto, UpdateRoomDto } from './room.dto.js';
import { Room } from '@entities/room.entity.js';
import { ResponseListDto } from '@common/dto/meta.dto.js';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard.js';
import { CurrentUserId } from '@common/decorators/index.js';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateRoomDto,
    @CurrentUserId() userId: number,
  ): Promise<Room> {
    return await this.roomService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:roomId')
  async update(
    @Body() dto: UpdateRoomDto,
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentUserId() userId: number,
  ): Promise<Room> {
    return await this.roomService.update(dto, userId, roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:roomId')
  async delete(
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentUserId() userId: number,
  ): Promise<Room> {
    return await this.roomService.delete(userId, roomId);
  }
}
