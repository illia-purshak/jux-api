import { IntersectionType } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, Max, Min, MinLength } from "class-validator";
// TODO: move each dto to their own files

// TODO2: move in constants regex.ts + remove special sign from pattern
const REGEX_PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export class LoginDto {
  @IsString()
  @MinLength(2)
  identifier: string; // name or email

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(64)
  name?: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(REGEX_PASSWORD)
  @Min(8)
  @Max(32)
  password: string;
}

export class AccessTokenDto {
  accessToken: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class TokenResponseDto extends IntersectionType(AccessTokenDto, RefreshTokenDto) {}
