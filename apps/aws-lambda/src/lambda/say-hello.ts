import { createLambdaHandler, parseJsonBody } from '@hexafy/aws-lambda';
import { Usecase } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

export interface SayHelloInput {
  name: string;
}

export interface SayHelloOutput {
  message: string;
}

class SayHelloUseCase extends Usecase<SayHelloInput, SayHelloOutput> {
  protected async executeInternal(
    input: SayHelloInput
  ): Promise<SayHelloOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    return {
      message: `Hello, ${input.name.trim()}! Welcome to hexagonal architecture.`
    };
  }
}

const sayHelloUseCase = new SayHelloUseCase();

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
