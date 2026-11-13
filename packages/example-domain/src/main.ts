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

const userRepository = new InMemoryUserRepository();
const taskRepository = new InMemoryTaskRepository();
const authenticationAdapter = new InMemoryAuthenticationAdapter(userRepository);

const createAuthUseCase = new CreateUseCase(userRepository);
const authenticateAuthUseCase = new AuthenticateUseCase(authenticationAdapter);
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);

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

registerUser().then(() => createTask());

export {
  authenticateAuthUseCase,
  completeTaskUseCase,
  createAuthUseCase,
  createTaskUseCase
};
