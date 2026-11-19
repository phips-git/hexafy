import type { EmailPort } from '../../application/ports';
import type { Email } from '../../domain/models';

export class EmailNoopAdapter implements EmailPort {
  private readonly logs: Email[] = [];

  async send(message: Email): Promise<void> {
    this.logs.push(message);
  }

  getSentEmails(): Email[] {
    return [...this.logs];
  }

  reset(): void {
    this.logs.length = 0;
  }
}
