# Quick Start

## Commands

```bash
bun install
bun run typecheck
bun run test
```

## Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Create changeset: `bun run changeset`
4. Open PR to `main` (CI + changeset check must pass)
5. Merge PR to `main`
6. Trigger **Release** workflow from GitHub Actions:
   - `RC` → publish to npm with `rc` tag (release candidates)
   - `Release` → publish to npm with `latest` tag (stable)

## Build & Test

```bash
bun install                # Install dependencies
bun run typecheck          # Type-check all packages
bun run test               # Run test suite
bun run lint --fix         # Format and lint (uses Bun lint)
bun run build             # Build all packages with tsdown
bun --filter @hexafy/core typecheck  # Package-level check for core work
```

## Publishing

- Development: Source files (`src/*.ts`) are used directly by Bun
- Publishing: `publishConfig.exports` swaps to `dist/` via `tsdown`
- Validation: `publint` checks package.json exports during CI
- Each PR to `main` requires a `.changeset/*.md` file

## tsdown Configuration

All packages use `@hexafy/tsdown-config` for bundling:

- Outputs `.mjs` (ESM) and `.d.mts` (types)
- Tree-shakes unused code
- Preserves `sideEffects: false` for optimal bundling

See [CODESTYLE.md](./CODESTYLE.md) and [../CONTRIBUTING.md](../CONTRIBUTING.md) for more details.
