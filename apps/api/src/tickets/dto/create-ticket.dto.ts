import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiPropertyOptional({ example: 'b123-uuid-of-book', description: 'Book ID or null for General query' })
  @IsOptional()
  @IsString()
  bookId?: string | null;

  @ApiProperty({ example: 'Royalty payout calculation for Q4', maxLength: 150 })
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(150, { message: 'Subject cannot exceed 150 characters' })
  subject: string;

  @ApiProperty({ example: 'I have a query regarding the net profit deductions for Amazon orders.', minLength: 20, maxLength: 5000 })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(5000, { message: 'Description cannot exceed 5,000 characters' })
  description: string;

  @ApiPropertyOptional({ description: 'Attachment metadata (name, size, type)' })
  @IsOptional()
  attachmentMeta?: Record<string, any>;
}
