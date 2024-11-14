// dto/login-user.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Users } from 'src/shared/entities/users.schema';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserResponse {
  readonly token: string;
  readonly data: Users;

  constructor(token: string, data: Users) {
    this.token = token;
    this.data = data;
  }
}
