import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Prisma, User } from '@prisma/client';
import { Roles, RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const access_token = await this.authService.login(req.user);

    res.cookie('token', access_token.token);
    return 'Success';
  }

  @Post('/register')
  register(@Body() data: Prisma.UserCreateInput) {
    return this.authService.register(data, true);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/registerInstructor')
  registerInstructor(@Body() data: Prisma.UserCreateInput) {
    return this.authService.register(data, false);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  getMe(@Request() req: any): Promise<User> {
    return this.authService.me(req.cookies['token'] ?? undefined);
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res) {
    res.cookie('token', '', { expires: new Date() });
    throw new HttpException('Forbidden', HttpStatus.NO_CONTENT);
  }
}
