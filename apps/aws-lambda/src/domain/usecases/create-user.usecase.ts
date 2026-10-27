import { RepositoryBase, UseCase, UseCaseError } from '@hex/core';

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UserCreated {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date
  ) {}
}

export class InMemoryUserRepository extends RepositoryBase<User, string> {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(entity: User): Promise<User> {
    this.users.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

export class CreateUserUseCase implements UseCase<
  CreateUserInput,
  UserCreated
> {
  constructor(private readonly userRepository: InMemoryUserRepository) {}

  async execute(input: CreateUserInput): Promise<UserCreated> {
    // Validate
    if (!input.name || input.name.trim().length === 0) {
      throw new UseCaseError('Name is required');
    }

    if (!input.email || !this.isValidEmail(input.email)) {
      throw new UseCaseError('Valid email is required');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findById(input.email);
    if (existingUser) {
      throw new UseCaseError('User with this email already exists');
    }

    // Create user
    const id = `user_${Date.now()}`;
    const user = new User(id, input.name.trim(), input.email, new Date());

    const created = await this.userRepository.save(user);

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      createdAt: created.createdAt
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
