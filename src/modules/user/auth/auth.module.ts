import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/users.entity.js';
import { UserCredentails } from '@entities/userCredentials.entity.js';
import { JwtSharedModule } from '../../../jwt/jwt.module.js';
import { DatabaseModule } from '../../../database/database.module.js';

@Module({
  imports: [JwtSharedModule, TypeOrmModule.forFeature([User, UserCredentails]), DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
