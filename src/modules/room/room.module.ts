import { Module } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { RoomController } from './room.controller.js';
import { User } from '@entities/users.entity.js';
import { Room } from '@entities/room.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
