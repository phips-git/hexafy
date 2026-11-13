import type { User } from '../../domain/auth/models';
import type { AuthenticationPort, UserPort } from '../../domain/auth/ports';

export class InMemoryAuthenticationAdapter implements AuthenticationPort {
  constructor(private readonly userRepository: UserPort) {}

  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

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

    const user = await this.userRepository.save({
      id: `user_${Date.now()}`,
      tenantId: `tenant_${Date.now()}`,
      email,
      name: name ?? null,
      role: 'member' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return user;
  }

  async validateToken(token: string): Promise<User | null> {
    if (token.startsWith('mock_token_')) {
      const userId = token.replace('mock_token_', '');
      return this.userRepository.findById(userId);
    }

    return null;
  }
}
