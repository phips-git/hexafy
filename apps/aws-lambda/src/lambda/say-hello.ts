import { createLambdaHandler, parseJsonBody } from '@hexafy/aws-lambda';
import { ConsoleLoggingAdapter } from '@hexafy/core/infrastructure';

import { SayHelloUseCase } from '../application';

const sayHelloUseCase = new SayHelloUseCase({
  identifier: () => `hello_${Date.now()}`,
  loggerFactory: () => ConsoleLoggingAdapter
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
