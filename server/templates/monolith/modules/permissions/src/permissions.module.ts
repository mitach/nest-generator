import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
// <!-- PERMISSIONS_IMPORTS -->

@Module({
  imports: [
    // <!-- PERMISSIONS_MODULES -->
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
