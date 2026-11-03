# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Roblox game written in Luau and synced into Roblox Studio with Rojo. Only a minimal scaffold exists so far (a shared `Greeting` module used by the server and client entry points). The game's design hasn't been decided yet; expand this file as it grows.

## Commands

Tools are pinned in `rokit.toml`; install with `rokit install`.

```bash
rojo serve                                   # live-sync src/ into Studio (connect via the Rojo plugin)
rojo build default.project.json -o game.rbxl # build a place file
rojo sourcemap -o sourcemap.json             # sourcemap for luau-lsp
selene src                                   # lint
stylua src                                   # format (stylua --check src to verify only)
```

There is no automated test runner yet; game behavior is tested by pressing Play in Studio. CI (`.github/workflows/ci.yml`) runs selene, stylua --check, and rojo build. If you change a tool version, update both `rokit.toml` and the CI workflow.

## Layout

`default.project.json` maps folders into the Roblox DataModel:

- `src/server/` → `ServerScriptService.Server` (server-only; `init.server.luau` is the entry Script)
- `src/client/` → `StarterPlayer.StarterPlayerScripts.Client` (per-player; `init.client.luau` is the entry LocalScript)
- `src/shared/` → `ReplicatedStorage.Shared` (ModuleScripts usable by both)

Rojo naming: `*.server.luau` = Script, `*.client.luau` = LocalScript, plain `*.luau` = ModuleScript, `init.*` makes the folder itself that script.

## Conventions

- Luau, `--!strict` at the top of modules; keep type errors at zero instead of loosening the mode.
- Get services with `game:GetService("...")`, never `game.ServiceName`.
- Never trust the client: validate everything a RemoteEvent/RemoteFunction receives on the server.
- Formatting is owned by StyLua (`stylua.toml`: tabs, 120 cols, double quotes); linting by Selene (`std = "roblox"`).
- `*.rbxl`/`*.rbxlx` builds, `sourcemap.json`, and Wally `Packages/` are gitignored.
