import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() registerDto: { email: string; password: string }) {
    try {
      const existingUser = await firstValueFrom(
        this.usersClient.send('user.findByEmail', {
          email: registerDto.email,
        }),
      );

      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      const hashedPassword = await firstValueFrom(
        this.authClient.send('auth.hashPassword', {
          password: registerDto.password,
        }),
      );

      const user = await firstValueFrom(
        this.usersClient.send('user.create', {
          email: registerDto.email,
          password: hashedPassword,
        }),
      );

      const tokens = await firstValueFrom(
        this.authClient.send('auth.generateTokens', {
          id: user.id || user._id,
          email: user.email,
        }),
      );

      return {
        message: 'Registration successful',
        user: {
          id: user.id || user._id,
          email: user.email,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      const user = await firstValueFrom(
        this.usersClient.send('user.findByEmail', { email: loginDto.email }),
      );

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await firstValueFrom(
        this.authClient.send('auth.comparePasswords', {
          password: loginDto.password,
          hash: user.password,
        }),
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const tokens = await firstValueFrom(
        this.authClient.send('auth.generateTokens', {
          id: user.id || user._id,
          email: user.email,
        }),
      );

      return {
        message: 'Login successful',
        user: {
          id: user.id || user._id,
          email: user.email,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  async refresh(@Body() { refreshToken }: { refreshToken: string }) {
    try {
      const tokens = await firstValueFrom(
        this.authClient.send('auth.refresh', { refreshToken }),
      );

      return {
        message: 'Token refreshed successfully',
        ...tokens,
      };
    } catch (error) {
      throw new HttpException('Token refresh failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
