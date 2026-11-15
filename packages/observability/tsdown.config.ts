import { createPackageConfig } from '@hexafy/tsdown-config';

export default createPackageConfig({
  entry: {
    application: 'src/application/index.ts',
    infrastructure: 'src/infrastructure/index.ts'
  }
});
