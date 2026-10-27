import type { LogContext, Logger } from './logger';

/**
 * Factory function for creating loggers by name
 */
export type LoggerFactory = (loggerName: string) => Logger;

/**
 * Dependencies required for use case execution
 */
export interface UsecaseExecutionDependencies {
  /**
   * Function to generate unique identifiers
   */
  generateId: () => string;
  /**
   * Factory function for creating loggers by name
   */
  loggerFactory: LoggerFactory;
}

/**
 * Abstract base class for all use cases
 *
 * This class provides the foundation for implementing use cases with
 * built-in cross-cutting concerns:
 * - Structured logging with execution context
 * - Unique execution IDs
 * - Duration tracking
 * - Error handling and logging
 *
 * @template TInput - The input type for the use case
 * @template TOutput - The output type for the use case
 *
 * @example
 * ```typescript
 * class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
 *   constructor(dependencies: UsecaseExecutionDependencies) {
 *     super(dependencies);
 *   }
 *
 *   protected async executeInternal(
 *     input: CreateUserInput,
 *     logger: Logger
 *   ): Promise<UserCreated> {
 *     // Your business logic here
 *     // Use the logger for any custom logging
 *     return { userId: this.dependencies.generateId() };
 *   }
 * }
 * ```
 */
export abstract class Usecase<TInput = void, TOutput = void> {
  constructor(protected readonly dependencies: UsecaseExecutionDependencies) {}

  /**
   * Abstract method to be implemented by subclasses
   * Contains the actual business logic
   *
   * @param input - The input data for the use case
   * @param logger - Logger instance for this execution
   * @returns Promise resolving to the output
   */
  protected abstract executeInternal(
    input: TInput,
    logger: Logger
  ): Promise<TOutput>;

  /**
   * Execute the use case with built-in cross-cutting concerns
   *
   * This method handles:
   * - Generating execution IDs
   * - Creating logger instances
   * - Tracking execution duration
   * - Error handling and logging
   *
   * @param input - The input data for the use case
   * @param executionContext - Additional context to include in logs
   * @returns Promise resolving to the output
   * @throws {Error} Any errors thrown by executeInternal
   */
  async execute(
    input: TInput,
    executionContext?: Record<string, unknown>
  ): Promise<TOutput> {
    const startTime = Date.now();
    const executionId = this.dependencies.generateId();
    const logger = this.dependencies.loggerFactory(this.constructor.name);

    try {
      const result = await this.executeInternal(input, logger);

      logger.info('Execution completed', {
        executionId,
        durationMs: Date.now() - startTime,
        ...executionContext,
      });

      return result;
    } catch (error) {
      const logContext: LogContext = {
        executionId,
        durationMs: Date.now() - startTime,
        ...(executionContext && { executionContext }),
      };

      if (error instanceof Error) {
        logContext.error = error;
      }

      logger.error('Execution failed', logContext);

      throw error;
    }
  }
}
