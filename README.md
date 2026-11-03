# Main-repositroy

A Roblox game, built with [Rojo](https://rojo.space) so the code lives in files and git instead of only inside Roblox Studio.

## One-time setup

1. Install [Roblox Studio](https://create.roblox.com/).
2. Install [Rokit](https://github.com/rojo-rbx/rokit) (the tool manager), then in this folder run:
   ```bash
   rokit install
   ```
   That installs Rojo, Selene (linter) and StyLua (formatter) at the versions in `rokit.toml`.
3. Install the Rojo plugin in Studio:
   ```bash
   rojo plugin install
   ```
4. Install [VS Code](https://code.visualstudio.com/) and accept the recommended extensions when it asks (Rojo, Luau LSP, StyLua, Selene).

## Daily workflow

1. Start the sync server:
   ```bash
   rojo serve
   ```
2. Open a place in Studio, open the **Rojo** plugin, and click **Connect**.
3. Edit `.luau` files in VS Code. Saves show up in Studio instantly. Press **Play** in Studio to test.

## Where code goes

| Folder        | Ends up in                                 | Runs on        |
| ------------- | ------------------------------------------ | -------------- |
| `src/server/` | `ServerScriptService.Server`               | Server only    |
| `src/client/` | `StarterPlayer.StarterPlayerScripts.Client`| Each player    |
| `src/shared/` | `ReplicatedStorage.Shared`                 | Both (modules) |

- `init.server.luau` / `init.client.luau` are the entry points.
- Other `.luau` files are ModuleScripts; load them with `require`.

## Checks

```bash
selene src              # lint
stylua src              # format (use --check to only check)
rojo build -o game.rbxl # build a place file
```

GitHub Actions runs all three on every push.
