import { Module } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { RoomController } from './room.controller.js';
import { User } from '@entities/users.entity.js';
import { Room } from '@entities/room.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtSharedModule } from '../../jwt/jwt.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room]), JwtSharedModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
