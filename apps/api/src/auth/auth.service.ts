import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AUTH_COOKIE_NAME } from '../common/constants';
import { ErrorCode } from '../common/errors/error-codes';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { author: true },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: ErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    return user;
  }

  async register(dto: RegisterDto, res: Response) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException({
        code: ErrorCode.EMAIL_ALREADY_EXISTS,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Public registration is strictly for Authors (Admins are pre-seeded operational staff)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const authorCode = `AUTH${randomSuffix}`;
    const bookCode = `BK${randomSuffix}`;
    const isbn = `978-93-5${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`;

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: dto.name.trim(),
        role: Role.AUTHOR,
        author: {
          create: {
            authorCode,
            name: dto.name.trim(),
            phone: dto.phone?.trim() || '+91 98000 00000',
            city: dto.city?.trim() || 'New Delhi',
            joinedDate: new Date(),
            books: {
              create: {
                bookCode,
                title: dto.initialBookTitle?.trim() || 'My Debut Manuscript',
                isbn,
                genre: 'Fiction & Literature',
                status: 'Published & Live',
                mrp: 399,
                royaltyPerCopy: 35,
                totalCopiesSold: 18,
                totalRoyaltyEarned: 630,
                royaltyPaid: 0,
                royaltyPending: 630,
                publicationDate: new Date(),
                availableOn: ['Amazon India', 'Flipkart', 'BookLeaf Store'],
              },
            },
          },
        },
      },
      include: { author: true },
    });

    return this.login(user, res);
  }

  async login(user: any, res: Response) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      authorId: user.author?.id,
    };

    const accessToken = this.jwtService.sign(payload);
    const isProduction = process.env.NODE_ENV === 'production';

    // Set Secure, SameSite, HttpOnly cookie
    res.cookie(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        authorId: user.author?.id,
        authorCode: user.author?.authorCode,
      },
      accessToken,
    };
  }

  async logout(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true, message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            authorCode: true,
            name: true,
            phone: true,
            city: true,
            joinedDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Session invalid or user not found',
      });
    }

    return user;
  }
}
