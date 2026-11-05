import {
  CancellationToken,
  LoggerPort,
  OperationCancelledError,
  Usecase,
  UsecaseExecutionDependencies
} from '@hexafy/core/application';

interface SayHelloInput {
  name: string;
}

interface SayHelloOutput {
  message: string;
}

/** Business rule error for validation failures. */
class BusinessRuleError extends Error {
  readonly code: string;

  constructor(message: string, code: string = 'BUSINESS_RULE') {
    super(message);
    this.code = code;
    this.name = 'BusinessRuleError';
  }
}

export class SayHelloUseCase extends Usecase<SayHelloInput, SayHelloOutput> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(
    input: SayHelloInput,
    logger: LoggerPort,
    cancellationToken?: CancellationToken
  ): Promise<SayHelloOutput> {
    // Handle cancellation
    if (cancellationToken?.isCancelled) {
      logger.warn('Request cancelled', { name: input.name });
      throw new OperationCancelledError(
        cancellationToken.reason ?? 'Request cancelled'
      );
    }

    // Business validation - log and throw
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
