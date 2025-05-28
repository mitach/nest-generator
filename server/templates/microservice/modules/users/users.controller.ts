import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get('test')
  async testAuthService() {
    const pattern = { cmd: 'users_message' };
    const payload = { message: 'Hello from API Gateway!' };

    return this.usersClient.send(pattern, payload);
  }
}
