import {
  Logger,
  Usecase,
  UseCaseError,
  UsecaseExecutionDependencies
} from '@hex/core';

export interface SayHelloInput {
  name: string;
}

export interface SayHelloOutput {
  message: string;
}

export class SayHelloUseCase extends Usecase<SayHelloInput, SayHelloOutput> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(
    input: SayHelloInput,
    logger: Logger
  ): Promise<SayHelloOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new UseCaseError('Name is required');
    }

    logger.debug('Generating greeting', { name: input.name });

    return {
      message: `Hello, ${input.name.trim()}! Welcome to hexagonal architecture.`
    };
  }
}
