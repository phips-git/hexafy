import { describe, expect, it } from 'bun:test';

import type { Email } from '../../../domain/models';
import { EmailNoopAdapter } from '../email.noop.adapter';

describe('EmailNoopAdapter', () => {
  let adapter: EmailNoopAdapter;

  beforeEach(() => {
    adapter = new EmailNoopAdapter();
  });

  it('does not send emails, just logs them', async () => {
    const testEmail: Email = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
      text: 'Test text'
    };

    await adapter.send(testEmail);

    expect(adapter.getSentEmails()).toEqual([testEmail]);
  });

  it('resets logs', async () => {
    await adapter.send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    });

    adapter.reset();
    expect(adapter.getSentEmails()).toEqual([]);
  });
});
