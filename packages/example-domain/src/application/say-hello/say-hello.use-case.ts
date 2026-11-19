import type { LoggingPort } from '@hexafy/core/application';
import { UseCase, type UseCaseConfiguration } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

export interface SayHelloInput {
  name: string;
}

export interface SayHelloOutput {
  message: string;
}

export class SayHelloUseCase extends UseCase<SayHelloInput, SayHelloOutput> {
  constructor(config: UseCaseConfiguration = {}) {
    super(config);
  }

  protected async executeInternal(
    input: SayHelloInput,
    logger: LoggingPort
  ): Promise<SayHelloOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    logger.info('Generating greeting', { name: input.name });

    return {
      message: `Hello, ${input.name.trim()}! Welcome to hexagonal architecture.`
    };
  }
}
