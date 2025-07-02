import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthService } from '../services/google-auth.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Redirects to Google
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req) {
    const tokens = await this.googleAuthService.googleLoginOrRegister(req.user);

    return {
      message: 'Logged in with Google',
      tokens: tokens,
      user: {
        email: req.user.email,
      },
    };
  }
}
