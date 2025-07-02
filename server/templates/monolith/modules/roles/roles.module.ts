import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
// <!-- ROLES_IMPORTS -->

@Module({
  imports: [
    // <!-- ROLES_MODULES -->
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
