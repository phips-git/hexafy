import { createPackageConfig } from '@hexafy/tsdown-config';

export default createPackageConfig({
  entry: {
    domain: 'src/domain.export.ts',
    infrastructure: 'src/infrastructure.export.ts'
  }
});
