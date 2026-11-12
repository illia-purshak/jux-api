import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @MinLength(2)
  identifier: string; // name or email

  @IsString()
  @MinLength(8)
  @MaxLength(24)
  password: string;
}
