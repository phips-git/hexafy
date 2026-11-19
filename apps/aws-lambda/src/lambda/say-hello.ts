import {
  type APIGatewayEvent,
  createLambdaHandler,
  formatError,
  formatJsonResponse,
  parseJsonBody
} from '@hexafy/aws-lambda';
import {
  type SayHelloInput,
  type SayHelloOutput,
  SayHelloUseCase
} from '@hexafy/example-domain/application';

const sayHelloUseCase = new SayHelloUseCase();

export const handler = createLambdaHandler<SayHelloInput, SayHelloOutput>({
  useCase: sayHelloUseCase,
  inputTransformer: (event: APIGatewayEvent): SayHelloInput => {
    return parseJsonBody(event) as SayHelloInput;
  },
  responseFormatter: formatJsonResponse,
  errorFormatter: formatError
});
