import { Body, Controller } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class JwtAuthController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @MessagePattern('auth.generateTokens')
  async generateTokens({ id, email }: { id: string; email: string }) {
    return this.jwtAuthService.generateTokens({ id, email });
  }

  @MessagePattern('auth.refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.jwtAuthService.refresh(body.refreshToken);
  }
}
