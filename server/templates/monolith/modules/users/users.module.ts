import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// <!-- USER_IMPORTS -->

@Module({
  imports: [
    // <!-- USER_MODULES -->
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
