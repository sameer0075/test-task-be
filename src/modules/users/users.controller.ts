import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersEndpoints } from 'src/shared/endpoints';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import StatusCodes from 'src/common/enums/ErrorCodes';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(UsersEndpoints.createUser)
  async signup(@Res() response: Response, @Body() body: CreateUserDto) {
    try {
      const data = await this.usersService.signup(body);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(UsersEndpoints.loginUser)
  async signin(@Res() response: Response, @Body() body: LoginUserDto) {
    try {
      const data = await this.usersService.signin(body);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: true, message: error });
    }
  }

  @Get(UsersEndpoints.listUsers)
  async listUsers(@Res() response: Response) {
    try {
      const data = await this.usersService.listUsers();
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: true, message: error });
    }
  }
}
