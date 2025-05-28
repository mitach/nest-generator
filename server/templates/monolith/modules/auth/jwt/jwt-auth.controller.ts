import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthService } from './jwt-auth.service';

@Controller('auth')
export class JwtAuthController {
  constructor(private readonly jwtAuthService: JwtAuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.jwtAuthService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.jwtAuthService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.jwtAuthService.refresh(body.refreshToken);
  }
}
