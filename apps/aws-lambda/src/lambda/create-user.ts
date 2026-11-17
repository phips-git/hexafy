import { createLambdaHandler, parseJsonBody } from '@hexafy/aws-lambda';
import { InMemoryUserRepository } from '@hexafy/example-domain/infrastructure';

import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';

const userRepository = new InMemoryUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);

export const handler = createLambdaHandler({
  useCase: createUserUseCase,
  inputTransformer: parseJsonBody,
  responseFormatter: (output) => ({
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      data: output
    })
  }),
  errorFormatter: (error) => ({
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: error.message
    })
  })
});
