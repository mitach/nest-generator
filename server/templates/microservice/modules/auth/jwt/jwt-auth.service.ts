import { Injectable } from '@nestjs/common';
import { AppService } from '../app.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly authService: AppService,
    private readonly jwtService: JwtService,
  ) {}

  generateTokens(payload: { id: string; email: string }) {
    const accessToken = this.jwtService.sign(
      {
        sub: payload.id,
        email: payload.email,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION || '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: payload.id,
        email: payload.email,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return this.generateTokens({
      id: payload.sub,
      email: payload.email,
      // <!-- GENERATE_TOKENS_REFRESH -->
    });
  }
}
