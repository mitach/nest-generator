import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
// <!-- USERS_CONTROLLER_IMPORTS -->

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // <!-- USERS_CONTROLLER_METHODS -->
}
