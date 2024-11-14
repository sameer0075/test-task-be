import { Module, applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

/**
 * Decorator function that adds API response tags to a class.
 * These tags are used to document the API endpoints.
 *
 * @returns {ClassDecorator} The class decorator function.
 */
export const ApiResponseTags = (): ClassDecorator => {
  // Apply decorators to create API response tags.
  return applyDecorators(
    // Module decorator for the class.
    Module({
      controllers: [], // No controllers for this class.
      providers: [], // No providers for this class.
      exports: [], // No exports for this class.
    }),
    // API response for successful deletion.
    ApiOkResponse({ description: 'Data was deleted successfully' }),
    // API response for successful creation.
    ApiCreatedResponse({ description: 'Data Created Successfully' }),
    // API response for unprocessable entity.
    ApiUnprocessableEntityResponse({ description: 'Bad Request' }),
    // API response for not found.
    ApiNotFoundResponse({ description: 'Data not found' }),
    // API response for forbidden request.
    ApiForbiddenResponse({ description: 'Unauthorized Request' }),
  );
};
