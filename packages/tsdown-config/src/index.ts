import type { UserConfig } from 'tsdown';

export const createPackageConfig = (config: UserConfig): UserConfig => ({
  ...{
    format: 'esm',
    target: 'es2022',
    dts: true,
    clean: true,
    sourcemap: true,
    publint: true
  },
  ...config
});
