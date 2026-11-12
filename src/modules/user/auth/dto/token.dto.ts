import { IntersectionType } from "@nestjs/swagger";

export class AccessTokenDto {
  accessToken: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class TokenResponseDto extends IntersectionType(AccessTokenDto, RefreshTokenDto) {}
