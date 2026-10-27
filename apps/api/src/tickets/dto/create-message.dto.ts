import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'Thank you for checking. Here is the requested clarification.', maxLength: 5000 })
  @IsString()
  @IsNotEmpty({ message: 'Message body cannot be empty' })
  @MaxLength(5000, { message: 'Message cannot exceed 5,000 characters' })
  body: string;
}
