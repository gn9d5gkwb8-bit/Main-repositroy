# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A TypeScript/Node starter project. It currently contains only a minimal scaffold (`src/index.ts` with a `greet` function and its test) — no application logic, framework, or architecture has been decided yet. This file should be expanded as the project grows.

## Commands

```bash
npm install          # install dependencies
npm run dev           # run src/index.ts with auto-reload (tsx watch)
npm run build         # compile TypeScript to dist/
npm start             # run the compiled output (dist/index.js)
npm test              # run the full test suite once (vitest run)
npm run test:watch    # run tests in watch mode
npm run lint           # check lint issues (eslint .)
npm run lint:fix       # auto-fix lint issues
npm run format          # format all files with Prettier
npm run format:check    # check formatting without writing
```

Run a single test file: `npx vitest run src/index.test.ts`
Run tests matching a name: `npx vitest run -t "greets the given name"`

## Stack and conventions

- TypeScript, ES modules (`"type": "module"` in package.json), Node >=20.
- Module resolution is `NodeNext` — relative imports within `src/` must include the `.js` extension (e.g. `import { greet } from "./index.js"`), even though the source file is `.ts`.
- Tests live alongside source files as `*.test.ts` and use Vitest (`describe`/`it`/`expect`).
- ESLint (flat config in `eslint.config.js`) uses `typescript-eslint` recommended rules with `eslint-config-prettier` to disable stylistic rules that Prettier owns. Prettier is the sole source of formatting (`.prettierrc.json`).
- `tsconfig.json` has `strict: true` — keep new code strict-mode clean rather than adding `any` or suppressions.
- Compiled output goes to `dist/` and is gitignored; never edit files there directly.
