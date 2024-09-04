import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @IsOptional()
  @Transform(({ value }) => value.trim())
  name?: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
    {
      message:
        'Password must contain at least one number, one lowercase letter, one uppercase letter, one special character, and be between 8 and 50 characters long.',
    },
  )
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^(0|\+234)(80|81|90|91|70|71)\d{8}$/, {
    message: 'Phone number must be a valid Nigerian phone number.',
  })
  @Transform(({ value }) => {
    value = value.trim();
    if (value.startsWith('0')) {
      return `+234${value.slice(1)}`;
    }

    return value;
  })
  phone: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  address?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class UpdateOwnerDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @IsOptional()
  @Transform(({ value }) => value.trim())
  name?: string;

  @ApiProperty()
  @IsOptional()
  @Matches(/^(0|\+234)(80|81|90|91|70|71)\d{8}$/, {
    message: 'Phone number must be a valid Nigerian phone number.',
  })
  @Transform(({ value }) => {
    value = value.trim();
    if (value.startsWith('0')) {
      return `+234${value.slice(1)}`;
    }
    return value;
  })
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  address?: string;
}

export class GetOwnerByIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
