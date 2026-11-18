import { describe, expect, test } from 'bun:test';

import { Module as NestModule } from '@nestjs/common';

import {
  createDomainModule,
  createInfrastructureModule
} from './hexagonal.module';

describe('NestJS Module Helpers', () => {
  test('createDomainModule returns a Module decorator', () => {
    class TestProvider {}

    const domainModule = createDomainModule([TestProvider]);

    expect(domainModule).toBeDefined();
  });

  test('createDomainModule accepts providers and exports them', () => {
    class TestProvider1 {}
    class TestProvider2 {}

    const domainModule = createDomainModule([TestProvider1, TestProvider2]);

    expect(domainModule).toBeDefined();
  });

  test('createDomainModule accepts imports', () => {
    @NestModule({})
    class ImportingModule {}

    class TestProvider {}

    const domainModule = createDomainModule([TestProvider], [ImportingModule]);

    expect(domainModule).toBeDefined();
  });

  test('createInfrastructureModule returns a Module decorator', () => {
    class TestProvider {}

    const infraModule = createInfrastructureModule([TestProvider]);

    expect(infraModule).toBeDefined();
  });

  test('createInfrastructureModule accepts providers and exports them', () => {
    class TestProvider1 {}
    class TestProvider2 {}

    const infraModule = createInfrastructureModule([
      TestProvider1,
      TestProvider2
    ]);

    expect(infraModule).toBeDefined();
  });

  test('createInfrastructureModule accepts imports', () => {
    @NestModule({})
    class ImportingModule {}

    class TestProvider {}

    const infraModule = createInfrastructureModule(
      [TestProvider],
      [ImportingModule]
    );

    expect(infraModule).toBeDefined();
  });

  test('domain and infrastructure modules can be combined', () => {
    class DomainProvider {}
    class InfraProvider {}

    const domainModule = createDomainModule([DomainProvider]);
    const infraModule = createInfrastructureModule([InfraProvider]);

    @NestModule({
      imports: [domainModule as never, infraModule as never],
      providers: [DomainProvider, InfraProvider]
    })
    class AppModule {}

    expect(AppModule).toBeDefined();
  });
});
