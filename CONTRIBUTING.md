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
6. Trigger **Release** workflow from GitHub Actions:
   - `RC` → publish to npm with `rc` tag (release candidates)
   - `Release` → publish to npm with `latest` tag (stable)

## Changesets

- **Required**: Every PR to `main` needs a `.changeset/*.md` file
- **Blocks merge**: CI fails without it
- **Release channel**: selected at workflow dispatch time (`rc` or `latest`)
- **PR guidance comment**: posted automatically by the Changesets PR-status workflow

## Release process

Release is handled via GitHub Actions **Release** workflow:

| Channel   | npm tag  | Use                |
| --------- | -------- | ------------------ |
| `RC`      | `rc`     | Release candidates |
| `Release` | `latest` | Stable releases    |

Workflow steps: version → build → publish → GitHub release.

## CI Gates

| Branch | Changeset Required? | Behavior                                |
| ------ | ------------------- | --------------------------------------- |
| `main` | ✅ Yes              | CI checks (`lint`, `typecheck`, `test`) |

## Commands

| Command             | Purpose               |
| ------------------- | --------------------- |
| `bun run changeset` | Create changeset      |
| `bun run typecheck` | TypeScript validation |
| `bun run test`      | Run tests             |
| `bun run build`     | Generate dist/        |
