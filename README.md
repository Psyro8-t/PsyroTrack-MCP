# PsyroTrack MCP 🚀

**Tagline:** "PsyroTrack MCP - Notion ka Baap, Free for Lifetime"

PsyroTrack MCP is an advanced, privacy-first routine and habit tracking Model Context Protocol (MCP) Server created by **Psyro8-t**.

## How It Works (Privacy & Data Isolation)
Your data belongs exclusively to **YOU**. No cloud, no databases, no shared repositories.
All tracker data is stored entirely on your own local machine inside your OS home directory:
`~/.psyrotrack/data.json`

## Features
- **Default Protocols**: By default, you get Psyro8-t's legendary 10 protocols:
  1. Wake up 6 am
  2. Study for 3 hr
  3. 3 hour code
  4. 2.5hr coding
  5. Updating Content
  6. 30+ min exercise
  7. Walk up to 3k steps
  8. Read book 10-20 min
  9. Write your expense
  10. Create new things
- **Customizable**: Want your own routine? Use the `set_protocols` or `init_user` tools to wipe the template and use your own completely isolated tracker list!
- **Stats & Trackers**: Generate dynamic monthly reports and streak statistics natively inside Claude/Cursor.

## Installation

### For Claude Desktop App
1. Clone or download this repository.
2. Run `npm install` inside the folder.
3. Open your Claude desktop config file:
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
4. Add the following to your config:

```json
{
  "mcpServers": {
    "psyrotrack": {
      "command": "node",
      "args": ["/ABSOLUTE_PATH_TO_THIS_FOLDER/index.js"]
    }
  }
}
