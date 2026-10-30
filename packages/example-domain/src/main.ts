/**
 * Example entry point demonstrating how to wire up the todo application using
 *
 * @hexafy/core primitives
 */

import { consoleLogger, UsecaseExecutionDependencies } from '@hexafy/core';

import {
  AuthenticateUseCase,
  CreateUseCase
} from './application/auth/usecases';
import {
  CompleteTaskUseCase,
  CreateTaskUseCase
} from './application/task-management/usecases';
import {
  InMemoryAuthenticationAdapter,
  InMemoryUserRepository
} from './infrastructure/auth/adapters';
import { InMemoryTaskRepository } from './infrastructure/task-management/adapters';

// Create repositories (infrastructure)
const userRepository = new InMemoryUserRepository();
const taskRepository = new InMemoryTaskRepository();
const authenticationAdapter = new InMemoryAuthenticationAdapter(userRepository);

// Configure use case dependencies
const dependencies: UsecaseExecutionDependencies = {
  generateId: () =>
    `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  loggerFactory: (name) => consoleLogger
};

// Create use cases (application)
const createAuthUseCase = new CreateUseCase(userRepository, dependencies);
const authenticateAuthUseCase = new AuthenticateUseCase(
  authenticationAdapter,
  dependencies
);
const createTaskUseCase = new CreateTaskUseCase(taskRepository, dependencies);
const completeTaskUseCase = new CompleteTaskUseCase(
  taskRepository,
  dependencies
);

// Example: Register a new user
async function registerUser() {
  const result = await createAuthUseCase.execute({
    email: 'john@example.com',
    password: 'password123',
    name: 'John Doe'
  });

  if (result.success) {
    console.log('User registered:', result.value.user.email);
  } else {
    console.error('Registration failed:', result.error.message);
  }
}

// Example: Create a task
async function createTask() {
  const result = await createTaskUseCase.execute({
    projectId: 'project_123',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation',
    priority: 'high'
  });

  if (result.success) {
    console.log('Task created:', result.value.title);
  } else {
    console.error('Task creation failed:', result.error.message);
  }
}

// Run examples
registerUser().then(() => createTask());

export {
  authenticateAuthUseCase,
  completeTaskUseCase,
  createAuthUseCase,
  createTaskUseCase
};
