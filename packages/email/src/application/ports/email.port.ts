import type { Email } from '../../domain/models';

export interface EmailPort {
  send(message: Email): Promise<void>;
}
