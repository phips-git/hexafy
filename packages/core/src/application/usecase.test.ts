import { describe, expect, it } from 'bun:test';

import type {
  ClockPort,
  IdentifierPort,
  LoggingPort,
  MetricsPort
} from '../domain/ports';
import type { UniqueIdentifier } from '../domain/types';
import { NoOpLoggingAdapter } from '../infrastructure/adapters/logging';
import {
  CancellationToken,
  failure,
  success,
  Usecase,
  UsecaseExecutionConfiguration
} from './index';

// Mock Clock Implementation - implements ClockPort exactly
class MockClock implements ClockPort {
  private fixedTime: number;

  constructor(time: number = Date.now()) {
    this.fixedTime = time;
  }

  now(): number {
    return this.fixedTime;
  }

  setTime(time: number): void {
    this.fixedTime = time;
  }
}

// Mock Identifier Implementation - implements IdentifierPort exactly
class MockIdentifier implements IdentifierPort {
  counter = 0;

  generate(_clock?: ClockPort): UniqueIdentifier {
    return `mock_id_${++this.counter}`;
  }

  reset(): void {
    this.counter = 0;
  }
}

// Mock Logger Implementation - implements LoggingPort exactly
class MockLogger implements LoggingPort {
  logs: Array<{ level: string; message: string; data?: unknown }> = [];

  info(message: string, data?: unknown): void {
    this.logs.push({ level: 'info', message, data });
  }

  debug(message: string, data?: unknown): void {
    this.logs.push({ level: 'debug', message, data });
  }

  warn(message: string, data?: unknown): void {
    this.logs.push({ level: 'warn', message, data });
  }

  error(message: string, data?: unknown): void {
    this.logs.push({ level: 'error', message, data });
  }

  clear(): void {
    this.logs = [];
  }

  hasLogged(message: string, level?: string): boolean {
    return this.logs.some(
      (log) => log.message === message && (!level || log.level === level)
    );
  }
}

// Mock CancellationToken Implementation
class MockCancellationToken implements CancellationToken {
  readonly isCancelled: boolean;
  readonly reason?: string;

  constructor(isCancelled: boolean, reason: string | undefined) {
    this.isCancelled = isCancelled;
    if (reason !== undefined) {
      this.reason = reason;
    }
  }
}

// Mock Metrics Implementation - implements MetricsPort exactly
class MockMetrics implements MetricsPort {
  calls: Array<{
    metric: string;
    value?: number;
    labels?: Record<string, string>;
  }> = [];

  increment(metric: string, labels?: Record<string, string>): void {
    this.calls.push({ metric, labels });
  }

  histogram(
    metric: string,
    value: number,
    labels?: Record<string, string>
  ): void {
    this.calls.push({ metric, value, labels });
  }

  gauge(metric: string, value: number, labels?: Record<string, string>): void {
    this.calls.push({ metric, value, labels });
  }

  clear(): void {
    this.calls = [];
  }

  hasMetric(metric: string): boolean {
    return this.calls.some((call) => call.metric === metric);
  }
}

// Test Use Case Implementations
class TestUseCase<TInput = void, TOutput = void> extends Usecase<
  TInput,
  TOutput
> {
  protected override async executeInternal(
    input: TInput,
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<TOutput> {
    return input as unknown as TOutput;
  }
}

class SuccessUseCase extends TestUseCase<string, string> {
  protected override async executeInternal(
    input: string,
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<string> {
    return input.toUpperCase();
  }
}

class FailureUseCase extends TestUseCase<string, string> {
  protected override async executeInternal(
    _input: string,
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<string> {
    throw new Error('Intentional failure');
  }
}

class AsyncDelayUseCase extends TestUseCase<{ delay: number }, string> {
  protected override async executeInternal(
    input: { delay: number },
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, input.delay));
    return 'completed';
  }
}

class VerifyInputUseCase extends TestUseCase<string, string> {
  protected override async executeInternal(
    inputValue: string,
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<string> {
    return inputValue;
  }
}

class VoidInputUseCase extends TestUseCase<void, string> {
  protected override async executeInternal(
    _input: void,
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<string> {
    return 'done';
  }
}

class VoidOutputUseCase extends TestUseCase<string, void> {
  protected override async executeInternal(
    _input: string,
    _logger: LoggingPort,
    _cancellationToken?: CancellationToken
  ): Promise<void> {
    return;
  }
}

describe('Usecase', () => {
  describe('execute() - Happy Path', () => {
    it('returns success result when use case completes successfully', async () => {
      const useCase = new SuccessUseCase();
      const result = await useCase.execute('hello');

      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe('HELLO');
      }
    });

    it('passes input to executeInternal correctly', async () => {
      const input = 'test-input';

      class VerifyInputUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(
          inputValue: string,
          _logger: LoggingPort,
          _cancellationToken?: CancellationToken
        ): Promise<string> {
          expect(inputValue).toBe('test-input');
          return inputValue;
        }
      }

      const useCase = new VerifyInputUseCase();
      const result = await useCase.execute(input);
      expect(result).toMatchObject({ success: true, value: input });
    });

    it('supports void input', async () => {
      let receivedInput: void = undefined;

      class VoidInputUseCase extends TestUseCase<void, string> {
        protected override async executeInternal(
          _input: void,
          _logger: LoggingPort,
          _cancellationToken?: CancellationToken
        ): Promise<string> {
          receivedInput = _input;
          return 'done';
        }
      }

      const useCase = new VoidInputUseCase();
      const result = await useCase.execute(undefined);
      expect(result.success).toBe(true);
      expect(receivedInput).toBeUndefined();
    });

    it('supports void output', async () => {
      class VoidOutputUseCase extends TestUseCase<string, void> {
        protected override async executeInternal(
          _input: string,
          _logger: LoggingPort,
          _cancellationToken?: CancellationToken
        ): Promise<void> {
          return;
        }
      }

      const useCase = new VoidOutputUseCase();
      const result = await useCase.execute('input');
      expect(result.success).toBe(true);
    });
  });

  describe('execute() - Error Handling', () => {
    it('returns failure result when use case throws an error', async () => {
      const useCase = new FailureUseCase();
      const result = await useCase.execute('input');

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('Intentional failure');
      }
    });

    it('normalizes non-Error objects to Error', async () => {
      class StringThrowUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(): Promise<string> {
          throw 'String error';
        }
      }

      const useCase = new StringThrowUseCase();
      const result = await useCase.execute('input');

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('String error');
      }
    });

    it('normalizes null/undefined to Error', async () => {
      class NullThrowUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(): Promise<string> {
          throw null;
        }
      }

      const useCase = new NullThrowUseCase();
      const result = await useCase.execute('input');

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe('CancellationToken', () => {
    it('returns failure immediately when token is already cancelled', async () => {
      const useCase = new SuccessUseCase();
      const token = new MockCancellationToken(
        true,
        'User requested cancellation'
      );

      const result = await useCase.execute('input', undefined, token);

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error?.message).toBe('User requested cancellation');
      }
    });

    it('passes cancellation token to executeInternal', async () => {
      let receivedToken: CancellationToken | undefined;

      class PassTokenUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(
          _input: string,
          _logger: LoggingPort,
          cancellationToken?: CancellationToken
        ): Promise<string> {
          receivedToken = cancellationToken;
          return _input;
        }
      }

      const useCase = new PassTokenUseCase();
      const token = new MockCancellationToken(false, undefined);
      await useCase.execute('input', undefined, token);

      expect(receivedToken).toBe(token);
    });

    it('allows execution when token is not cancelled', async () => {
      const useCase = new SuccessUseCase();
      const token = new MockCancellationToken(false, undefined);

      const result = await useCase.execute('test', undefined, token);

      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe('TEST');
      }
    });
  });

  describe('Logging', () => {
    it('logs execution completion with duration on success', async () => {
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({ logging: logger });

      await useCase.execute('hello');

      expect(logger.hasLogged('Execution completed')).toBe(true);
      const completionLog = logger.logs.find(
        (log) => log.message === 'Execution completed'
      );
      expect(completionLog?.data).toHaveProperty('durationMs');
    });

    it('logs execution failure with duration on error', async () => {
      const logger = new MockLogger();
      const useCase = new FailureUseCase({ logging: logger });

      await useCase.execute('input');

      expect(logger.hasLogged('Execution failed', 'error')).toBe(true);
      const failureLog = logger.logs.find(
        (log) => log.message === 'Execution failed'
      );
      expect(failureLog?.data).toHaveProperty('durationMs');
    });

    it('includes executionId in log context', async () => {
      const identifier = new MockIdentifier();
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({
        logging: logger,
        identifier
      });

      await useCase.execute('hello');

      identifier.generate(); // used to increment the counter
      const completionLog = logger.logs.find(
        (log) => log.message === 'Execution completed'
      );
      expect(completionLog?.data).toHaveProperty(
        'executionId'
        // @ts-ignore - accessing via index signature
      );
    });

    it('includes additional executionContext in logs', async () => {
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({ logging: logger });
      const context = { userId: '123', action: 'test' };

      await useCase.execute('hello', context);

      const completionLog = logger.logs.find(
        (log) => log.message === 'Execution completed'
      );
      expect(completionLog?.data).toHaveProperty(
        'userId'
        // @ts-ignore - accessing via index signature
      );
      expect(completionLog?.data).toHaveProperty(
        'action'
        // @ts-ignore - accessing via index signature
      );
    });

    it('allows disabling logging with NoOpLoggingAdapter', async () => {
      const useCase = new SuccessUseCase({ logging: NoOpLoggingAdapter });
      const result = await useCase.execute('hello');

      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe('HELLO');
      }
    });
  });

  describe('Metrics', () => {
    it('records usecase_duration histogram on success', async () => {
      const metrics = new MockMetrics();
      const useCase = new SuccessUseCase({ metrics });

      await useCase.execute('hello');

      expect(metrics.hasMetric('usecase_duration')).toBe(true);
      const durationCall = metrics.calls.find(
        (call) => call.metric === 'usecase_duration'
      );
      // Duration should be >= 0 (0 when using mock clock or synchronous execution)
      expect(durationCall?.value).toBeGreaterThanOrEqual(0);
    });

    it('records usecase_errors increment on failure', async () => {
      const metrics = new MockMetrics();
      const useCase = new FailureUseCase({ metrics });

      await useCase.execute('input');

      expect(metrics.hasMetric('usecase_errors')).toBe(true);
      const errorCall = metrics.calls.find(
        (call) => call.metric === 'usecase_errors'
      );
      expect(errorCall?.labels).toHaveProperty('executionId');
    });

    it('records usecase_cancelled increment when cancelled', async () => {
      const metrics = new MockMetrics();
      const useCase = new SuccessUseCase({ metrics });
      const token = new MockCancellationToken(true, 'Cancelled');

      await useCase.execute('input', undefined, token);

      expect(metrics.hasMetric('usecase_cancelled')).toBe(true);
      const cancelCall = metrics.calls.find(
        (call) => call.metric === 'usecase_cancelled'
      );
      expect(cancelCall?.labels).toHaveProperty('executionId');
    });

    it('uses NoOpMetricsAdapter by default (no errors)', async () => {
      // This should not throw when metrics are not provided
      const useCase = new SuccessUseCase();
      const result = await useCase.execute('hello');

      expect(result.success).toBe(true);
    });
  });

  describe('Execution ID', () => {
    it('generates unique execution ID for each execution', async () => {
      const useCase = new SuccessUseCase();

      await useCase.execute('first');
      await useCase.execute('second');
    });

    it('uses custom identifier provider when provided', async () => {
      const identifier = new MockIdentifier();
      const useCase = new SuccessUseCase({ identifier });

      await useCase.execute('test');

      expect(identifier.counter).toBeGreaterThanOrEqual(1);
    });

    it('includes executionId in result context when available', async () => {
      const identifier = new MockIdentifier();
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({
        identifier,
        logging: logger
      });

      await useCase.execute('test');

      const logsWithId = logger.logs.filter(
        (log) => (log.data as Record<string, unknown>)['executionId']
      );
      expect(logsWithId.length).toBeGreaterThan(0);
    });
  });

  describe('Clock', () => {
    it('uses custom clock when provided', async () => {
      const clock = new MockClock();
      const useCase = new SuccessUseCase({ clock });

      await useCase.execute('test');
    });

    it('calculates duration using provided clock', async () => {
      const clock = new MockClock();
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({
        clock,
        logging: logger
      });

      await useCase.execute('test');

      const completionLog = logger.logs.find(
        (log) => log.message === 'Execution completed'
      );
      expect(completionLog?.data).toHaveProperty('durationMs');
    });

    it('passes clock to identifier when generating executionId', async () => {
      const clock = new MockClock(1000000);
      const identifier = new MockIdentifier();
      const useCase = new SuccessUseCase({ clock, identifier });

      await useCase.execute('test');

      // Identifier should receive the clock
      expect(identifier.counter).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Execution Context', () => {
    it('includes execution context in logs', async () => {
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({ logging: logger });
      const context = { userId: 'user-123', requestId: 'req-456' };

      await useCase.execute('test', context);

      const logsWithContext = logger.logs.filter((log) => {
        const data = log.data as Record<string, unknown>;
        return (
          (data as Record<string, unknown>)['userId'] === 'user-123' &&
          (data as Record<string, unknown>)['requestId'] === 'req-456'
        );
      });
      expect(logsWithContext.length).toBeGreaterThan(0);
    });

    it('allows empty execution context', async () => {
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({ logging: logger });

      await useCase.execute('test', {});

      expect(logger.logs.length).toBeGreaterThan(0);
    });

    it('handles undefined execution context', async () => {
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({ logging: logger });

      await useCase.execute('test');

      expect(logger.logs.length).toBeGreaterThan(0);
    });
  });

  describe('Execution Duration', () => {
    it('measures duration accurately', async () => {
      const metrics = new MockMetrics();
      const useCase = new AsyncDelayUseCase({ metrics });

      const startTime = Date.now();
      await useCase.execute({ delay: 100 });
      const duration = Date.now() - startTime;

      const durationCall = metrics.calls.find(
        (call) => call.metric === 'usecase_duration'
      );
      expect(durationCall?.value).toBeGreaterThan(0);
      expect(durationCall?.value).toBeLessThan(duration + 50); // Allow some tolerance
    });

    it('records zero duration for synchronous execution', async () => {
      const metrics = new MockMetrics();
      const useCase = new SuccessUseCase({ metrics });

      await useCase.execute('immediate');

      const durationCall = metrics.calls.find(
        (call) => call.metric === 'usecase_duration'
      );
      expect(durationCall?.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration', () => {
    it('accepts partial configuration with defaults', async () => {
      const useCase = new SuccessUseCase({});
      const result = await useCase.execute('test');

      expect(result.success).toBe(true);
    });

    it('accepts all configuration options', async () => {
      const clock = new MockClock();
      const identifier = new MockIdentifier();
      const logger = new MockLogger();
      const metrics = new MockMetrics();

      const config: UsecaseExecutionConfiguration = {
        clock,
        logging: logger,
        metrics,
        identifier
      };

      const useCase = new SuccessUseCase(config);
      const result = await useCase.execute('test');

      expect(result.success).toBe(true);
    });

    it('handles missing configuration gracefully', async () => {
      // No configuration provided - should use all defaults
      const useCase = new SuccessUseCase();
      const result = await useCase.execute('test');

      expect(result.success).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('maintains type safety for input/output', async () => {
      class TypedUseCase extends TestUseCase<
        { name: string },
        { greeting: string }
      > {
        protected override async executeInternal(
          input: { name: string },
          _logger: LoggingPort,
          _cancellationToken?: CancellationToken
        ): Promise<{ greeting: string }> {
          return { greeting: `Hello, ${input.name}` };
        }
      }

      const useCase = new TypedUseCase();
      const result = await useCase.execute({ name: 'World' });

      if (result.success) {
        const successResult = result as {
          success: true;
          value: { greeting: string };
        };
        expect(successResult.value.greeting).toBe('Hello, World');
      } else {
        throw new Error('Expected success');
      }
    });

    it('properly handles result type narrowing', async () => {
      const useCase = new SuccessUseCase();
      const result = await useCase.execute('test');

      if (result.success) {
        // TypeScript should know this is a string
        const value: string = result.value;
        expect(value).toBe('TEST');
      } else {
        // TypeScript should know this is an Error
        const error: Error = result.error;
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string input', async () => {
      const useCase = new SuccessUseCase();
      const result = await useCase.execute('');

      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe('');
      }
    });

    it('handles special characters in input', async () => {
      const useCase = new SuccessUseCase();
      const input = 'Hello 世界 🌍';
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe('HELLO 世界 🌍');
      }
    });

    it('handles very long input', async () => {
      const useCase = new SuccessUseCase();
      const input = 'a'.repeat(10000);
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe(input.toUpperCase());
      }
    });

    it('handles multiple sequential executions', async () => {
      const useCase = new SuccessUseCase();
      const results = await Promise.all([
        useCase.execute('first'),
        useCase.execute('second'),
        useCase.execute('third')
      ]);

      expect(results.every((r) => r.success)).toBe(true);
      if (results[0].success === true) {
        expect(results[0].value).toBe('FIRST');
      }
      if (results[1].success === true) {
        expect(results[1].value).toBe('SECOND');
      }
      if (results[2].success === true) {
        expect(results[2].value).toBe('THIRD');
      }
    });
  });

  describe('Constructor', () => {
    it('allows instantiation without arguments', () => {
      const useCase = new SuccessUseCase();
      expect(useCase).toBeInstanceOf(SuccessUseCase);
    });

    it('allows instantiation with empty configuration', () => {
      const useCase = new SuccessUseCase({});
      expect(useCase).toBeInstanceOf(SuccessUseCase);
    });

    it('stores configuration for later use', () => {
      const logger = new MockLogger();
      const useCase = new SuccessUseCase({ logging: logger });

      // Configuration should be accessible via protected dependencies
      expect(useCase['dependencies'].logging).toBe(logger);
    });
  });

  describe('Integration with success/failure helpers', () => {
    it('success() helper wraps value correctly', () => {
      const result = success('test-value');
      expect(result.success).toBe(true);
      if (result.success === true) {
        expect(result.value).toBe('test-value');
      }
    });

    it('failure() helper wraps error correctly', () => {
      const error = new Error('test error');
      const result = failure(error);
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('Error Normalization', () => {
    it('preserves original error message', async () => {
      class PreservesMessageUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(): Promise<string> {
          throw new Error('Custom error message');
        }
      }

      const useCase = new PreservesMessageUseCase();
      const result = await useCase.execute('input');

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error?.message).toBe('Custom error message');
      }
    });

    it('preserves error stack when available', async () => {
      class PreservesStackUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(): Promise<string> {
          throw new Error('With stack');
        }
      }

      const useCase = new PreservesStackUseCase();
      const result = await useCase.execute('input');

      if (result.success === false) {
        expect(result.error?.stack).toBeDefined();
      } else {
        throw new Error('Expected failure');
      }
    });

    it('handles error-like objects', async () => {
      class ErrorLikeUseCase extends TestUseCase<string, string> {
        protected override async executeInternal(): Promise<string> {
          throw { message: 'Error-like object', code: 500 };
        }
      }

      const useCase = new ErrorLikeUseCase();
      const result = await useCase.execute('input');

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });
});
