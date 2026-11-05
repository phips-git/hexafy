# Agent Configuration

Use this file as the entry point for agent-facing guidance in this repository.

## Documentation

- **[.agents/CODESTYLE.md](./.agents/CODESTYLE.md)** - Coding standards and patterns
- **[.agents/PROJECT-STRUCTURE.md](./.agents/PROJECT-STRUCTURE.md)** - Package layout and import patterns
- **[.agents/QUICKSTART.md](./.agents/QUICKSTART.md)** - Fast workflow overview
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contributor and release process

## Guidelines

Agents should follow repository codestyle and architecture boundaries:

- Write self-explanatory code with clear naming
- Maintain complete type safety (no `any` types)
- No unnecessary comments or JSDoc
- Import directly from source modules
- Follow hexagonal architecture boundaries

## Bun Commands

Use Bun for package management and scripts in local development. The release process remains pnpm-only for pack/publish so `publishConfig.exports` is applied consistently.

```bash
bun install
bun run <script>
bun run changeset
```

Current release rule: Bun is still used for development and local scripts, but the actual package publication path is still `pnpm` in CI:

- `pnpm -r pack --pack-destination /tmp/hexafy-packs`
- `pnpm exec changeset publish`
- `pnpm exec publint run "$tgz"` and `pnpm exec attw "$tgz"` on packed tarballs

This is required because the repo intentionally relies on pnpm to apply `publishConfig.exports` overrides and rewrite `workspace:*` dependencies during packaging. Avoid `npm publish` and `bun publish` for publishable workspace packages until Bun matches the same release behavior.
