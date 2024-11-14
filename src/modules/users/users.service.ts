import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { Users } from 'src/shared/entities/users.schema';
import { LoginUserDto, UserResponse } from './dto/login-user.dto';
import {
  comparePassword,
  generateToken,
} from 'src/common/helper/utils/helper-functions';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}

  /**
   * User signup
   * @param body Signup details
   * @returns Newly created user entity
   */
  async signup(body: CreateUserDto): Promise<Users> {
    const userExists = await this.userModel
      .findOne({ email: body.email })
      .exec();

    // Verify User Exists
    if (userExists) {
      throw new HttpException(
        'User with this email already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create a new user entity
    const createdUser = new this.userModel(body);

    // Save the user to the database
    const data = await createdUser.save();
    const user = data.toObject();
    delete user.password;
    return user;
  }

  /**
   * User login
   * @param body Login details
   * @returns User entity with the token
   * @throws {HttpException} If the credentials are invalid
   */
  async signin(body: LoginUserDto): Promise<{ token: string; data: Users }> {
    // Find user by email
    const { email, password } = body;
    const data = await this.userModel.findOne({ email }).exec();
    const user = data.toObject();

    // If user is not found
    if (!user) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Compare the password
    const isPasswordValid = await comparePassword(password, user.password);
    // If the password is invalid
    if (!isPasswordValid) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create the token payload
    const tokenPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    // Remove the password from the response
    delete user.password;

    // Generate the token
    const token = await generateToken(tokenPayload);

    // Return the user with the token
    return new UserResponse(token, user);
  }

  /**
   * Retrieves a list of all users.
   *
   * @returns A promise that resolves to an array of user entities
   *          without their passwords.
   */
  async listUsers(): Promise<Users[]> {
    // Query the database to find all user entities
    // Exclude the password field from the returned documents
    return await this.userModel.find().select('-password');
  }
}
