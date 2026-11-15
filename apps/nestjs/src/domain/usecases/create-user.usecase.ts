import { CreateUseCase } from '@hexafy/example-domain/application';
import { InMemoryUserRepository } from '@hexafy/example-domain/infrastructure';
import { Injectable } from '@nestjs/common';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UserCreated {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

@Injectable()
export class CreateUserUseCase {
  private readonly delegate: CreateUseCase;

  constructor() {
    this.delegate = new CreateUseCase(new InMemoryUserRepository());
  }

  async execute(input: CreateUserInput): Promise<
    | {
        success: true;
        value: {
          user: { id: string; email: string; name: string | null };
          token: string;
        };
      }
    | { success: false; error: Error }
  > {
    return this.delegate.execute({
      email: input.email,
      password: input.password,
      name: input.name
    });
  }
}
