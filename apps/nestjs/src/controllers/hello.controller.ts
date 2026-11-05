import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  SayHelloInput,
  SayHelloOutput,
  SayHelloUseCase
} from '../domain/usecases/say-hello.usecase';

@Controller('hello')
export class HelloController {
  constructor(private readonly sayHelloUseCase: SayHelloUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async hello(@Body() input: SayHelloInput): Promise<SayHelloOutput> {
    const result = await this.sayHelloUseCase.execute(input);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }
}
