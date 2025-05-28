import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "../../users/users.service";

@Injectable()
export class GoogleAuthService {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    async googleLoginOrRegister(profile: any) {
        let user = await this.usersService.findByEmail(profile.email);

        if (!user) {
            user = await this.usersService.createUser({
                email: profile.email,
                password: '', // няма парола
            });
        }

        return this.authService.generateTokens(user);
    }
}