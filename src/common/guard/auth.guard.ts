import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import * as jwt from 'jsonwebtoken';

import { generateToken } from '../helper/utils/helper-functions';
import { AuthGuardInterface } from './interface';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Method to check if the user can activate the route by verifying the JWT token.
   * If the token is valid, it sets the user object in the request.
   * If the token is expired, it refreshes the token and sets the user object in the request.
   * If the token is invalid, it throws an UnauthorizedException.
   *
   * @param {ExecutionContext} context - The execution context of the route.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating if the user can activate the route.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the request object from the execution context
    const request = context.switchToHttp().getRequest();

    // Extract the token from the request headers
    const token = this.extractToken(request);
    // If no token is found, throw an UnauthorizedException
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      // Verify the token using the JWT_SECRET environment variable
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'NO_SECRET');
      // Set the decoded user object in the request
      request.user = decoded;

      // Return true to indicate that the user can activate the route
      return true;
    } catch (err) {
      // If the token is expired, refresh the token and set the decoded user object in the request
      if (err.name === 'TokenExpiredError') {
        const refreshedToken = this.refreshToken(token);
        request.headers.authorization = `Bearer ${refreshedToken}`;
        const decoded = jwt.verify(refreshedToken, process.env.JWT_SECRET ?? 'NO_SECRET');
        request.user = decoded;
        return true;
      } else {
        // If the token is invalid, throw an UnauthorizedException
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  /**
   * Extracts the token from the request headers.
   *
   * @param {any} request - The request object.
   * @return {string | null} The extracted token or null if no token is found.
   */
  private extractToken(request): string | null {
    // Get the authorization header from the request headers
    const authorizationHeader = request.headers.authorization;

    // If no authorization header is found, return null
    if (!authorizationHeader) {
      return null;
    }

    // Split the authorization header by a space and get the second element (the token)
    const [, token] = authorizationHeader.split(' ');

    // Return the extracted token
    return token;
  }

  /**
   * Refreshes the token by decoding it, extracting the necessary payload,
   * and generating a new token without setting expiresIn.
   *
   * @param {string} token - The token to be refreshed.
   * @return {string} The refreshed token.
   * @throws {Error} If the token payload is invalid.
   */
  private refreshToken(token: string): string {
    // Decode the token
    const decoded = jwt.decode(token);

    // Check if the decoded token is an object and not null
    if (typeof decoded === 'object' && decoded !== null) {
      // Typecast the decoded token to AuthGuardInterface for type safety
      const authGuard: AuthGuardInterface = decoded as AuthGuardInterface;

      // Extract the necessary payload from the decoded token
      const payload = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };

      // Generate a new token without setting expiresIn
      const refreshedToken = generateToken(payload);

      // Return the refreshed token
      return refreshedToken;
    } else {
      // If the token payload is invalid, throw an error
      throw new Error('Invalid token payload');
    }
  }
}
