import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminReplyDto {
  @ApiProperty({ example: 'Thank you for contacting BookLeaf. We have resolved your issue.' })
  @IsString()
  @IsNotEmpty({ message: 'Reply body cannot be empty' })
  @MaxLength(5000, { message: 'Reply cannot exceed 5000 characters' })
  body: string;

  @ApiPropertyOptional({ description: 'ID of the AiDraft if reply was based on AI draft' })
  @IsOptional()
  @IsString()
  aiDraftId?: string;
}
