import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';
import { Roles, RolesGuard } from 'src/auth/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() data: Prisma.UserCreateInput) {
    return this.userService.createUser(data);
  }

  @Get()
  getAll(@Req() request: Request) {
    return this.userService.getAllUsers();
  }

  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  @Post('/role')
  addRole(@Body() data) {
    return this.userService.addRole(data);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/ban')
  banUser(@Body() data: { userId: number; banReason: string }) {
    return this.userService.banUser(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/enroll/:classId')
  enrollToClass(
    @Request() req,
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.userService.enrollToClass(classId, req.user?.id);
  }
}
