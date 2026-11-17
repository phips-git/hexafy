import { createLambdaHandler, parseJsonBody } from '@hexafy/aws-lambda';

import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';

const createUserUseCase = new CreateUserUseCase();

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
