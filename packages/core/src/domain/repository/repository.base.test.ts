import { describe, expect, it } from 'bun:test';

import { Entity } from '../primitives/entity';
import { RepositoryBase } from './repository.base';

class TestEntity extends Entity<string> {
  constructor(
    id: string,
    public value: string
  ) {
    super(id);
  }

  toJSON(): Record<string, unknown> {
    return { id: this.getId(), value: this.value };
  }
}

class TestRepository extends RepositoryBase<TestEntity, string> {
  private readonly map = new Map<string, TestEntity>();

  async findById(id: string): Promise<TestEntity | null> {
    return this.map.get(id) ?? null;
  }

  async findAll(): Promise<TestEntity[]> {
    return Array.from(this.map.values());
  }

  async save(entity: TestEntity): Promise<TestEntity> {
    this.map.set(entity.getId(), entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }
}

describe('RepositoryBase', () => {
  it('reports existence using findById', async () => {
    const repository = new TestRepository();
    const entity = new TestEntity('a-1', 'first');
    await repository.save(entity);

    await expect(repository.exists('a-1')).resolves.toBe(true);
    await expect(repository.exists('missing')).resolves.toBe(false);
  });

  it('updates by delegating to save', async () => {
    const repository = new TestRepository();
    const entity = new TestEntity('b-2', 'second');

    await expect(repository.update(entity)).resolves.toBe(entity);
    await expect(repository.findById('b-2')).resolves.toBe(entity);
  });
});
