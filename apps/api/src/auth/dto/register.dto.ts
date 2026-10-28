import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Rohit Verma', description: 'Full name of author or admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'rohit.verma@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123', description: 'Password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.AUTHOR, description: 'Role (AUTHOR or ADMIN)' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.AUTHOR;

  @ApiPropertyOptional({ example: '+91 98765 43210', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Bengaluru', description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'The Silent Horizon', description: 'Initial book title for author catalog' })
  @IsOptional()
  @IsString()
  initialBookTitle?: string;
}
