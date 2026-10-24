import { Room } from '@entities/room.entity.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryRoomDto, ROOM_RESPONSE_FIELDS } from './room.dto.js';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) { }

  async findOne(id: number, query: QueryRoomDto): Promise<Room | null> {
    const { fields } = query;

    // TODO: Its not safe to let user know the actual fiedls names, even whitelisted ones. Is it?
    // Maybe Mapper would solve this issue?
    const select = fields?.filter((field) =>
      ROOM_RESPONSE_FIELDS.includes(field),
    ).map((field) => `rm.${field}`);

    const queryBuilder = this.roomRepository.createQueryBuilder('rm')
      .andWhere({ id });

    if (select?.length) queryBuilder.select(select);

    return await queryBuilder.getOne();
  }
}
