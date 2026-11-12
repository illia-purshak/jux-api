import { Transform } from "class-transformer";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { REGEX_NO_SPEC_SIGNS, REGEX_PASSWORD } from "@constants/regex.constants.js";

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  @Matches(REGEX_NO_SPEC_SIGNS)
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @IsString()
  @Matches(REGEX_PASSWORD)
  @MinLength(8)
  @MaxLength(24)
  password: string;
}
