import type {
  TenantId,
  User,
  UserId,
  UserRole
} from '../../domain/auth/models';
import type { UserPort } from '../../domain/auth/ports';

export type CreateUseCaseInput = {
  email: string;
  password: string;
  name?: string | null;
};

export type CreateUseCaseOutput = {
  user: User;
  token: string;
};

export class CreateUseCase {
  constructor(private readonly userPort: UserPort) {}

  async execute(
    input: CreateUseCaseInput
  ): Promise<
    | { success: true; value: CreateUseCaseOutput }
    | { success: false; error: Error }
  > {
    if (!this.isValidEmail(input.email)) {
      return { success: false, error: new Error('Invalid email format') };
    }

    const existingUser = await this.userPort.findByEmail(input.email);
    if (existingUser) {
      return { success: false, error: new Error('User already exists') };
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

    return { success: true, value: { user: savedUser, token } };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
