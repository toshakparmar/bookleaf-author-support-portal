import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_COOKIE_NAME } from '../../common/constants';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Extract from httpOnly Cookie
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies[AUTH_COOKIE_NAME];
          }
          return token;
        },
        // 2. Fallback to Bearer token header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'bookleaf-super-secret-jwt-key-change-in-production-min-32-chars',
    });
  }

  async validate(payload: { sub: string; email: string; role: 'AUTHOR' | 'ADMIN' }): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { author: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      authorId: user.author?.id,
      authorCode: user.author?.authorCode,
    };
  }
}
