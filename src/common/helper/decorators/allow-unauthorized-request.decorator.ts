import { SetMetadata } from '@nestjs/common';

/**
 * This decorator is used to allow unauthorized requests.
 * It sets metadata to indicate that the request should bypass the authentication guard.
 * This is typically used for public endpoints.
 *
 * @returns {Function} - The SetMetadata decorator with metadata for 'allowUnauthorizedRequest' set to true.
 */
export const AllowUnauthorizedRequest = (): MethodDecorator =>
  SetMetadata('allowUnauthorizedRequest', true);
