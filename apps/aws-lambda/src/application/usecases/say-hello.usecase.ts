import {
  type CancellationToken,
  type LoggingPort,
  Usecase,
  type UsecaseConfiguration
} from '@hexafy/core/application';

interface SayHelloInput {
  name: string;
}

interface SayHelloOutput {
  message: string;
}

class BusinessRuleError extends Error {
  readonly code: string;

  constructor(message: string, code: string = 'BUSINESS_RULE') {
    super(message);
    this.code = code;
    this.name = 'BusinessRuleError';
  }
}

export class SayHelloUseCase extends Usecase<SayHelloInput, SayHelloOutput> {
  constructor(dependencies: UsecaseConfiguration) {
    super(dependencies);
  }

  protected async executeInternal(
    input: SayHelloInput,
    logger: LoggingPort,
    cancellationToken?: CancellationToken
  ): Promise<SayHelloOutput> {
    if (cancellationToken?.isCancelled) {
      logger.warn('Request cancelled', { name: input.name });
      throw new Error(cancellationToken.reason ?? 'Request cancelled');
    }

    if (!input.name || input.name.trim().length === 0) {
      logger.warn('Invalid input', { name: input.name });
      throw new BusinessRuleError('Name is required', 'VALIDATION_ERROR');
    }

    logger.debug('Generating greeting', { name: input.name });

    return {
      message: `Hello, ${input.name.trim()}! Welcome to hexagonal architecture.`
    };
  }
}
