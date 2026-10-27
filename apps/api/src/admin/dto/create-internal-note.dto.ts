import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInternalNoteDto {
  @ApiProperty({ example: 'Verified platform sales. Escalated to Repro India.' })
  @IsString()
  @IsNotEmpty({ message: 'Internal note body cannot be empty' })
  @MaxLength(3000, { message: 'Internal note cannot exceed 3000 characters' })
  body: string;
}
