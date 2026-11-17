import type { LoggingPort } from '@hexafy/core/application';
import { Usecase, type UsecaseConfiguration } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';
import { Injectable } from '@nestjs/common';

export interface SayHelloInput {
  name: string;
}

export interface SayHelloOutput {
  message: string;
}

@Injectable()
export class SayHelloUseCase extends Usecase<SayHelloInput, SayHelloOutput> {
  constructor(config: UsecaseConfiguration = {}) {
    super(config);
  }

  protected async executeInternal(
    input: SayHelloInput,
    logger: LoggingPort
  ): Promise<SayHelloOutput> {
    if (!input.name || input.name.trim().length === 0) {
      logger.warn('Invalid input', { name: input.name });
      throw new ValidationError('Name is required');
    }

    logger.info('Generating greeting', { name: input.name });

    return {
      message: `Hello, ${input.name.trim()}! Welcome to hexagonal architecture.`
    };
  }
}
