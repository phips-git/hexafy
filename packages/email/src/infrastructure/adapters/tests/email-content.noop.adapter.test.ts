import { describe, expect, it } from 'bun:test';

import { EmailContentNoopAdapter } from '../email-content.noop.adapter';

describe('EmailContentNoopAdapter', () => {
  let adapter: EmailContentNoopAdapter;

  beforeEach(() => {
    adapter = new EmailContentNoopAdapter();
  });

  it('generates password reset email', async () => {
    const email = await adapter.generatePasswordReset(
      'user@example.com',
      'https://example.com/reset/abc123'
    );

    expect(email.to).toBe('user@example.com');
    expect(email.subject).toBe('Password Reset Test');
    expect(email.html).toContain('{{RESET_LINK}}');
    expect(email.idempotencyKey!).toContain('password-reset-');
  });

  it('generates email verification email', async () => {
    const email = await adapter.generateEmailVerification(
      'user@example.com',
      'https://example.com/verify/xyz789'
    );

    expect(email.to).toBe('user@example.com');
    expect(email.subject).toBe('Email Verification Test');
    expect(email.html).toContain('{{VERIFICATION_LINK}}');
    expect(email.idempotencyKey!).toContain('verification-');
  });

  it('generates tenant invitation email', async () => {
    const email = await adapter.generateTenantInvitation(
      'user@example.com',
      'Acme Corp',
      'https://example.com/invite/def456'
    );

    expect(email.to).toBe('user@example.com');
    expect(email.subject).toContain('Acme Corp');
    expect(email.html).toContain('{{INVITE_LINK}}');
    expect(email.idempotencyKey!).toContain('invitation-');
  });
});
