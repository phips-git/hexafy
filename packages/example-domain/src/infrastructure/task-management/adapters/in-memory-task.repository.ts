import type {
  Task,
  TaskCreationProperties,
  TaskUpdateProperties
} from '../../domain/task-management/models';
import type { TaskPort } from '../../domain/task-management/ports';

export class InMemoryTaskRepository implements TaskPort {
  private readonly tasks: Map<string, Task> = new Map();

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedTo === assigneeId
    );
  }

  async create(data: TaskCreationProperties): Promise<Task> {
    const task: Task = {
      id: `task_${Date.now()}`,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      priority: data.priority ?? 'medium',
      status: 'pending',
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    return task;
  }

  async update(id: string, data: TaskUpdateProperties): Promise<Task> {
    const existing = this.tasks.get(id);
    if (!existing) {
      throw new Error('Task not found');
    }

    const updated: Task = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    this.tasks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }
}
