import { afterEach, describe, expect, it } from 'bun:test';

import { SystemIdentifierAdapter } from './system.identifier.adapter';

const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'crypto'
);

const restoreCrypto = (): void => {
  if (originalCryptoDescriptor !== undefined) {
    Object.defineProperty(globalThis, 'crypto', originalCryptoDescriptor);
  }
};

afterEach(restoreCrypto);

describe('SystemIdentifierAdapter', () => {
  it('uses crypto.randomUUID when available', () => {
    const id = SystemIdentifierAdapter.generate();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('falls back to time/random-based format without crypto.randomUUID', () => {
    const cryptoValue = globalThis.crypto;
    const patched =
      cryptoValue !== undefined
        ? { ...cryptoValue, randomUUID: undefined }
        : undefined;

    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: patched
    });

    const id = SystemIdentifierAdapter.generate({
      now: () => 1234567890
    });

    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]{8}$/i);
  });
});
