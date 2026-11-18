import { UseCase } from '@hexafy/core/application';
import { UnauthorizedError } from '@hexafy/core/domain';

import type { User } from '../../../domain/auth/models';
import type { AuthenticationPort } from '../../ports';

export type AuthenticateUseCaseInput = {
  email: string;
  password: string;
};

export type AuthenticateUseCaseOutput = {
  user: User;
  token: string;
};

export class AuthenticateUseCase extends UseCase<
  AuthenticateUseCaseInput,
  AuthenticateUseCaseOutput
> {
  constructor(private readonly authenticationPort: AuthenticationPort) {
    super();
  }

  protected async executeInternal(
    input: AuthenticateUseCaseInput
  ): Promise<AuthenticateUseCaseOutput> {
    const user = await this.authenticationPort.authenticate(
      input.email,
      input.password
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = `mock_token_${user.id}`;

    return { user, token };
  }
}
