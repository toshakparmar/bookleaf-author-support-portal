import { Module } from '@nestjs/common';
import { AuthorsController } from './authors.controller';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [BooksModule],
  controllers: [AuthorsController],
})
export class AuthorsModule {}
