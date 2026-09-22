# PsyroTrack MCP 🚀

**Tagline:** "PsyroTrack MCP - Notion ka Baap, Free for Lifetime"

PsyroTrack MCP is an advanced, privacy-first routine and habit tracking Model Context Protocol (MCP) Server created by **Psyro8-t**.

## How It Works (Privacy & Data Isolation)
Your data belongs exclusively to **YOU**. No cloud, no databases, no shared repositories.
All tracker data is stored entirely on your own local machine inside your OS home directory:
`~/.psyrotrack/data.json`

## Features
- **Default Protocols**: By default, you get Psyro8-t's legendary 10 protocols (Wake up 6am, 3hr code, etc.)
- **Customizable**: Want your own routine? Just tell the AI to set up your custom protocols!
- **Stats & Trackers**: Generate dynamic monthly reports and streak statistics natively inside Claude/Cursor.

## ⚡ Super Easy Installation (No Download Required!)

You don't need to download any code. Just use the `npx` command to run it directly from GitHub!

### For Claude Desktop App (Mac/Windows)
1. Open your Claude desktop config file:
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the following to your config:

```json
{
  "mcpServers": {
    "psyrotrack": {
      "command": "npx",
      "args": ["-y", "github:Psyro8-t/PsyroTrack-MCP"]
    }
  }
}
