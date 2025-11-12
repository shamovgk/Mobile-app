import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Регистрация нового пользователя
  async register(dto: RegisterDto) {
    // Проверяем, существует ли email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Создаём пользователя
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
        avatar: dto.avatar || null,
        isGuest: false,
        profile: {
          create: {
            totalXp: 0,
            level: 1,
            streak: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        isGuest: true,
      },
    });

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email!);

    return {
      user,
      ...tokens,
    };
  }

  // Вход пользователя
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email!);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isGuest: user.isGuest,
      },
      ...tokens,
    };
  }

  // Гостевой режим
  async loginAsGuest() {
    const guestName = `Guest${Math.floor(Math.random() * 10000)}`;

    const user = await this.prisma.user.create({
      data: {
        displayName: guestName,
        isGuest: true,
        profile: {
          create: {
            totalXp: 0,
            level: 1,
            streak: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        isGuest: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  // Получить профиль текущего пользователя
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        isGuest: true,
        profile: {
          select: {
            totalXp: true,
            level: true,
            streak: true,
            lastPlayedAt: true,
          },
        },
      },
    });

    return user;
  }

    // Генерация JWT токенов
    private async generateTokens(userId: string, email: string | null) {
      const payload = { sub: userId, email };

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

    // Обновление токенов
async refreshTokens(refreshToken: string) {
  try {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        isGuest: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
}