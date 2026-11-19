import type { UsecaseResult } from '@hexafy/core/application';
import { SayHelloUseCase } from '@hexafy/example-domain/application';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

interface SayHelloOutput {
  message: string;
}

@Controller('hello')
export class HelloController {
  constructor(private readonly sayHelloUseCase: SayHelloUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async hello(@Body() input: { name: string }): Promise<SayHelloOutput> {
    const result = (await this.sayHelloUseCase.execute(
      input
    )) as UsecaseResult<SayHelloOutput>;

    if (!result.success) {
      throw result.error;
    }

    return result.value;
  }
}
