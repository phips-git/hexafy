import type { Brand } from '@hexafy/core/domain';

import type { User } from '../../domain/auth/models';
import type { AuthenticationPort, UserPort } from '../../domain/auth/ports';

type BrandedUserId = Brand<string, 'UserId'>;

export class InMemoryAuthenticationAdapter implements AuthenticationPort {
  constructor(private readonly userRepository: UserPort) {}

  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In a real implementation, you would verify the password hash
    if (password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const userId = `user_${Date.now()}` as BrandedUserId;
    const tenantId = `tenant_${Date.now()}` as BrandedUserId;

    const user: User = {
      id: userId,
      tenantId: tenantId,
      email,
      name: name ?? null,
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.userRepository.save(user);
  }

  async validateToken(token: string): Promise<User | null> {
    if (token.startsWith('mock_token_')) {
      const userId = token.replace('mock_token_', '') as BrandedUserId;
      return this.userRepository.findById(userId);
    }

    return null;
  }
}
