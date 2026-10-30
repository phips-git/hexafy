import { GetAuthenticatedUserUsecase } from '@hexafy/auth/application';
import {
  AuthGuard,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly getAuthenticatedUserUsecase: GetAuthenticatedUserUsecase
  ) {
    super({});
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const result = await this.getAuthenticatedUserUsecase.execute({
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    if (!result.success || !result.value) {
      throw new UnauthorizedException();
    }

    request['user'] = result.value;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
