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

Use Bun for package management and scripts:

```bash
bun install
bun run <script>
bun run changeset
bun run changeset:version
bun run changeset:publish
```

Avoid using npm or pnpm commands - use bun instead.
