import { createLambdaHandler, parseJsonBody } from '@hexafy/aws-lambda';
import { consoleLogger } from '@hexafy/core';

import { SayHelloUseCase } from '../domain/usecases/say-hello.usecase';

const sayHelloUseCase = new SayHelloUseCase({
  generateId: () => `hello_${Date.now()}`,
  loggerFactory: (name) => consoleLogger
});

export const handler = createLambdaHandler({
  useCase: sayHelloUseCase,
  inputTransformer: parseJsonBody,
  responseFormatter: (output) => ({
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(output)
  }),
  errorFormatter: (error) => ({
    statusCode: error.message.includes('required') ? 400 : 500,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: error.message
    })
  })
});
