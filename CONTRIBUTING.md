# Contributing

## Quick Start

```bash
bun install
bun run typecheck
bun run test
```

## Branching Model

```
main (single source of truth) ← feature/* (short-lived work)
```

### Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Create changeset: `bun run changeset`
4. Open PR to `main` (CI + changeset check must pass)
5. Merge PR to `main`
6. Maintainer runs **Release** workflow from GitHub Actions and selects:
   - `rc` → publish to npm `next` dist-tag
   - `latest` → publish to npm `latest` dist-tag
7. Workflow pushes tags and creates GitHub Releases from Changesets changelog notes

## Changesets

- **Required**: Every PR to `main` needs a `.changeset/*.md` file
- **Blocks merge**: CI fails without it
- **Release channel**: selected at workflow dispatch time (`rc` or `latest`)
- **PR guidance comment**: posted automatically by the Changesets PR-status workflow

## Release process

Run the GitHub Actions **Release** workflow from `main`:

| Channel  | npm dist-tag | Intended use |
| -------- | ------------ | ------------ |
| `rc`     | `next`       | release candidates |
| `latest` | `latest`     | stable releases |

Release workflow behavior:

1. Versions packages from pending changesets
2. Publishes changed public packages
3. Pushes release tags
4. Creates GitHub Releases per package from generated changelog sections

### First initial release

For never-published packages:

1. Add a changeset that includes each package
2. Merge to `main`
3. Run Release with `latest` (or `rc` first, then `latest`)

## CI Gates

| Branch | Changeset Required? | Behavior                                |
| ------ | ------------------- | --------------------------------------- |
| `main` | ✅ Yes              | CI checks (`lint`, `typecheck`, `test`) |

## Commands

| Command                 | Purpose                  |
| ----------------------- | ------------------------ |
| `bun run changeset`     | Create version changeset |
| `bun run typecheck`     | TypeScript validation    |
| `bun run test`          | Run tests                |
| `bun run build`         | Generate dist/           |
| `bun publish --dry-run` | Verify package           |
