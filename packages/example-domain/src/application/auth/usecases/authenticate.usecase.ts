import type { UsecaseResult } from '@hexafy/core/application';

import type { User } from '../../domain/auth/models';
import type { AuthenticationPort } from '../../domain/auth/ports';

interface AuthenticateUseCaseInput {
  email: string;
  password: string;
}

interface AuthenticateUseCaseOutput {
  user: User;
  token: string;
}

export class AuthenticateUseCase {
  constructor(private readonly authenticationPort: AuthenticationPort) {}

  async execute(
    input: AuthenticateUseCaseInput
  ): Promise<UsecaseResult<AuthenticateUseCaseOutput>> {
    try {
      const user = await this.authenticationPort.authenticate(
        input.email,
        input.password
      );

      const token = `mock_token_${user.id}`;

      return { success: true, value: { user, token } };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
