import { Injectable } from '@nestjs/common';
// <!-- USER_IMPORTS -->

@Injectable()
export class UsersService {
  constructor(
    // <!-- USER_CONSTRUCTOR_ARGS -->
  ) {}

  async findByEmail(email: string): Promise<any> {
    // <!-- USER_FIND -->
    return null;
  }

  async createUser(data: { email: string; password?: string }): Promise<any> {
    // <!-- USER_CREATE -->
    return null;
  }
}
