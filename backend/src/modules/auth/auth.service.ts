import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/logger/logger.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
  sub: string;
  type: 'guest' | 'registered';
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${dto.email}`, 'AuthService');

    const existingUser = await this.prisma.registeredUser.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: Email ${dto.email} already exists`, 'AuthService');
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          displayName: dto.displayName,
          avatar: dto.avatar || null,
        },
      });

      await tx.registeredUser.create({
        data: {
          userId: user.id,
          email: dto.email,
          passwordHash,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
        },
      });

      this.logger.log(`User registered successfully: ${user.id} (${dto.email})`, 'AuthService');
      return { user, email: dto.email };
    });

    const tokens = await this.generateTokens(result.user.id, 'registered');

    return {
      user: {
        id: result.user.id,
        displayName: result.user.displayName,
        avatar: result.user.avatar,
        isGuest: false,
        email: result.email,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`, 'AuthService');

    const registeredUser = await this.prisma.registeredUser.findUnique({
      where: { email: dto.email },
      include: {
        user: true,
      },
    });

    if (!registeredUser) {
      this.logger.warn(`Login failed: User not found for email ${dto.email}`, 'AuthService');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      registeredUser.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email ${dto.email}`, 'AuthService');
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${registeredUser.userId}`, 'AuthService');

    const tokens = await this.generateTokens(registeredUser.userId, 'registered');

    return {
      user: {
        id: registeredUser.user.id,
        displayName: registeredUser.user.displayName,
        avatar: registeredUser.user.avatar,
        isGuest: false,
        email: registeredUser.email,
      },
      ...tokens,
    };
  }

  async loginAsGuest() {
    this.logger.log('Guest login attempt', 'AuthService');

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          displayName: `Guest_${Date.now()}`,
        },
      });

      await tx.guestUser.create({
        data: {
          userId: user.id,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
        },
      });

      this.logger.log(`Guest user created: ${user.id}`, 'AuthService');
      return user;
    });

    const tokens = await this.generateTokens(result.id, 'guest');

    return {
      user: {
        id: result.id,
        displayName: result.displayName,
        avatar: result.avatar,
        isGuest: true,
        email: null,
      },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    this.logger.debug(`Fetching profile for user: ${userId}`, 'AuthService');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        registeredUser: {
          select: {
            email: true,
          },
        },
        guestUser: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.error(`Profile not found for user: ${userId}`, '', 'AuthService');
      throw new NotFoundException('User not found');
    }

    const isGuest = !!user.guestUser;
    const email = user.registeredUser?.email || null;

    return {
      id: user.id,
      displayName: user.displayName,
      avatar: user.avatar,
      isGuest,
      email,
      profile: user.profile,
    };
  }

  private async generateTokens(
    userId: string,
    type: 'guest' | 'registered',
  ) {
    this.logger.debug(`Generating tokens for user: ${userId} (${type})`, 'AuthService');

    const payload: JwtPayload = {
      sub: userId,
      type,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    this.logger.log('Token refresh attempt', 'AuthService');
    
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          registeredUser: {
            select: {
              email: true,
            },
          },
          guestUser: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`Token refresh failed: User ${payload.sub} not found`, 'AuthService');
        throw new UnauthorizedException('Invalid refresh token');
      }

      this.logger.log(`Tokens refreshed successfully for user: ${user.id}`, 'AuthService');

      const isGuest = !!user.guestUser;
      const email = user.registeredUser?.email || null;

      const tokens = await this.generateTokens(user.id, payload.type);

      return {
        user: {
          id: user.id,
          displayName: user.displayName,
          avatar: user.avatar,
          isGuest,
          email,
        },
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error instanceof Error ? error.stack : '', 'AuthService');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
