# Project Structure

## New Package Rules

Use these rules when adding any package, with extra checks for companion packages.

1. **Boundary first**: define what belongs in the package and what must stay in existing packages.
2. **Exports are explicit**: define `exports` and matching `publishConfig.exports` for every public entrypoint.
3. **Public API quality**: add concise JSDoc for exported classes, functions, and interfaces.
4. **README minimum**: include purpose, scope/non-goals, install, and one concrete usage example.
5. **Validation gate**: `test`, `typecheck`, and `build` must pass for the new package before release.

### Companion package rules

For packages that extend core behavior (for example observability adapters):

1. **No contract duplication**: reuse `@hexafy/core` ports/types instead of redefining them.
2. **Dependency model**: declare `@hexafy/core` as a `peerDependency`; keep a workspace devDependency for local development/tests.
3. **Separation of concerns**: keep primitives/contracts in core, and policy-heavy adapters in the companion package.
4. **Integration docs**: show how the companion package plugs into `@hexafy/core` (not standalone-only examples).

## README standard (mandatory for all packages)

All package READMEs in this repository must follow the same structure order as the package family standard.
Use this as a requirement, not a suggestion.
The documentation approach is mandatory drift-resistant by default: avoid duplicating mutable API details in multiple docs; reference canonical files where possible.

## Root README

The repository root README should focus on:

- Monorepo context and purpose
- Package navigation (link to core package README)
- Development setup and contribution workflow

### Exported artifacts table requirements

The `Exported artifacts and usage` section must cover all public exports from package entrypoints and include:

- explicit export name(s)
- entrypoint/subpath
- what it is for
- when to use it
- minimal usage guidance

Grouping is allowed only for closely related exports with the same purpose/usage pattern; grouped rows must still name every export explicitly.
If the package has multiple entrypoints (for example `/application`, `/domain`, `/infrastructure`), the table must cover all exported symbols across them exactly once.

### Companion package alignment requirements

For companion packages (e.g. `@hexafy/observability`, `@hexafy/nestjs`, `@hexafy/aws-lambda`):

- explicitly state dependency on `@hexafy/core`
- document default usage path with core first, companion second
- clearly separate default use (`UseCase`/injected ports) vs opt-in companion behavior
- avoid presenting the companion package as standalone architecture guidance

## Internal Structure

```
packages/<name>/
├── src/
│   ├── domain/          # Models, ports
│   ├── application/     # Use cases
│   └── infrastructure/  # Adapters
└── package.json
```

## Drift-resistant references

Do not duplicate long API snippets here. Use these as source of truth:

- `packages/*/README.md` - usage patterns and exported-artifact tables
- `packages/*/package.json` (`exports`, `publishConfig.exports`) - public entrypoints
- `packages/core/src/application/*` - application contracts (`UseCase`, ports, results)
- `packages/core/src/domain/*` - domain primitives, repository/unit-of-work, errors
- `packages/core/src/infrastructure/*` - default adapters

Also see [AGENTS.md](../AGENTS.md) and [CODESTYLE.md](./CODESTYLE.md).
