import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// <!-- USER_IMPORTS -->

@Module({
  imports: [
    // <!-- USER_MODULES -->
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
