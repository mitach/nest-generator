import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;
    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashed = await this.authService.hashPassword(password);
    const user = await this.usersService.createUser({
      ...dto,
      password: hashed,
    });

    return this.authService.generateTokens({
      id: user.id,
      email: user.email,
      // <!-- GENERATE_TOKENS_REGISTER -->
    });
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.authService.comparePasswords(password, user.password);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.authService.generateTokens({
      id: user.id?.toString() || user._id?.toString(),
      email: user.email,
      // <!-- GENERATE_TOKENS_LOGIN -->
    });
  }

  async refresh(refreshToken: string) {
    const payload = await this.authService['jwtService'].verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return this.authService.generateTokens({
      id: payload.sub,
      email: payload.email,
      // <!-- GENERATE_TOKENS_REFRESH -->
    });
  }
}
