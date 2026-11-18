import type {
  TenantId,
  User,
  UserId,
  UserRole
} from '../../../domain/auth/models';
import type { UserPort } from '../../ports';

export type CreateUseCaseInput = {
  email: string;
  password: string;
  name?: string | null;
};

export type CreateUseCaseOutput = {
  user: User;
  token: string;
};

import { UseCase } from '@hexafy/core/application';
import { ConflictError, ValidationError } from '@hexafy/core/domain';

export class CreateUseCase extends UseCase<
  CreateUseCaseInput,
  CreateUseCaseOutput
> {
  constructor(private readonly userPort: UserPort) {
    super();
  }

  protected async executeInternal(
    input: CreateUseCaseInput
  ): Promise<CreateUseCaseOutput> {
    if (!this.isValidEmail(input.email)) {
      throw new ValidationError('Invalid email format');
    }

    const existingUser = await this.userPort.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const userId = `user_${Date.now()}` as UserId;
    const tenantId = `tenant_${Date.now()}` as TenantId;

    const user: User = {
      id: userId,
      tenantId,
      email: input.email,
      name: input.name ?? null,
      role: (input.name ? 'member' : 'guest') as UserRole,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedUser = await this.userPort.save(user);
    const token = `mock_token_${savedUser.id}`;

    return { user: savedUser, token };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
