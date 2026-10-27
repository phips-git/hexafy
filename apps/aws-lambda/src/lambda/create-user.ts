import { createLambdaHandler, parseJsonBody } from '@hex/aws-lambda';
import { CreateUserUseCase, InMemoryUserRepository } from '../domain/usecases/create-user.usecase';

const userRepository = new InMemoryUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);

export const handler = createLambdaHandler({
  useCase: createUserUseCase,
  inputTransformer: parseJsonBody,
  responseFormatter: (output) => ({
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      data: output,
    }),
  }),
  errorFormatter: (error) => ({
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: false,
      error: error.message,
    }),
  }),
});
