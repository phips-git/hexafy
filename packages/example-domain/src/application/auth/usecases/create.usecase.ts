import type { Result } from '@hexafy/core/result';
import type { UsecaseExecutionDependencies } from '@hexafy/core/usecase';

import type { User } from '../../domain/auth/models';
import type { UserPort } from '../../domain/auth/ports';

interface CreateUseCaseInput {
  email: string;
  password: string;
  name?: string;
}

interface CreateUseCaseOutput {
  user: User;
  token: string;
}

export class CreateUseCase {
  constructor(
    private readonly userPort: UserPort,
    private readonly dependencies: UsecaseExecutionDependencies
  ) {}

  async execute(
    input: CreateUseCaseInput
  ): Promise<Result<CreateUseCaseOutput>> {
    // Validate email format
    if (!this.isValidEmail(input.email)) {
      return { success: false, error: new Error('Invalid email format') };
    }

    // Check if user already exists
    const existingUser = await this.userPort.findByEmail(input.email);
    if (existingUser) {
      return { success: false, error: new Error('User already exists') };
    }

    // Create new user
    const user = await this.userPort.save({
      id: this.dependencies.generateId?.() ?? `user_${Date.now()}`,
      tenantId: this.dependencies.generateId?.() ?? `tenant_${Date.now()}`,
      email: input.email,
      name: input.name ?? null,
      role: 'member' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Generate token (in real implementation, use JWT library)
    const token = `mock_token_${user.id}`;

    return { success: true, value: { user, token } };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
