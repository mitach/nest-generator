import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) { }

	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, 10);
	}

	async comparePasswords(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	generateTokens(payload: {
		id: string;
		email: string;
		// <!-- PAYLOAD_PROPS -->
	}) {
		const accessToken = this.jwtService.sign(
			{
				sub: payload.id,
				email: payload.email,
				// <!-- ACCESS_TOKEN_PROPS -->
			},
			{
				secret: process.env.JWT_SECRET,
				expiresIn: process.env.JWT_EXPIRATION || '15m',
			}
		);

		const refreshToken = this.jwtService.sign(
			{ 
				sub: payload.id,
				email: payload.email,
				// <!-- REFRESH_TOKEN_PROPS -->
			},
			{
				secret: process.env.JWT_REFRESH_SECRET,
				expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
			}
		);

		return {
			accessToken,
			refreshToken,
		};
	}
}
