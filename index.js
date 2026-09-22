#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import os from "os";

// --- Data Isolation & Storage Setup ---
const DATA_DIR = path.join(os.homedir(), ".psyrotrack");
const DATA_FILE = path.join(DATA_DIR, "data.json");

const DEFAULT_PROTOCOLS = [
  { id: "1", name: "Wake up 6 am", time: "06:00" },
  { id: "2", name: "Study for 3 hr", time: "3 hours" },
  { id: "3", name: "3 hour code", time: "3 hours" },
  { id: "4", name: "2.5hr coding", time: "2.5 hours" },
  { id: "5", name: "Updating Content", time: "" },
  { id: "6", name: "30+ min exercise", time: "30+ mins" },
  { id: "7", name: "Walk up to 3k steps", time: "" },
  { id: "8", name: "Read book 10-20 min", time: "10-20 mins" },
  { id: "9", name: "Write your expense", time: "" },
  { id: "10", name: "Create new things", time: "" },
];

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialState = {
      initialized: false,
      protocols: [],
      ticks: {}, // format: "YYYY-MM-DD": ["id1", "id2"]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialState, null, 2), "utf8");
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getLocalDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString().split('T')[0];
}

// --- MCP Server Setup ---
const server = new Server(
  {
    name: "PsyroTrack MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- Define Tools ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "init_user",
        description:
          "Run this ON FIRST INSTALL. Ask user: 'Do you want to use default Psyro protocols or create your own?'. Use this tool to initialize the local tracker.",
        inputSchema: {
          type: "object",
          properties: {
            useDefault: { type: "boolean", description: "True to use Psyro8-t defaults" },
            customProtocols: {
              type: "array",
              description: "List of custom protocols if useDefault is false",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  time: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["useDefault"],
        },
      },
      {
        name: "add_protocol",
        description: "Add a new protocol to track.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            time: { type: "string" },
          },
          required: ["name"],
        },
      },
      {
        name: "remove_protocol",
        description: "Remove a protocol by its ID.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
      {
        name: "set_protocols",
        description: "Replace all current protocols with a completely new list.",
        inputSchema: {
          type: "object",
          properties: {
            protocols: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  time: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["protocols"],
        },
      },
      {
        name: "tick_protocol",
        description: "Mark a protocol as done (or toggle off) for a specific date (YYYY-MM-DD).",
        inputSchema: {
          type: "object",
          properties: {
            date: { type: "string", description: "YYYY-MM-DD" },
            protocol_id: { type: "string" },
          },
          required: ["date", "protocol_id"],
        },
      },
      {
        name: "show_tracker",
        description: "Show the tracker progress for a specific month.",
        inputSchema: {
          type: "object",
          properties: {
            month: { type: "string", description: "YYYY-MM format" },
          },
          required: ["month"],
        },
      },
      {
        name: "show_stats",
        description: "Calculate and show streaks and completion percentages.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "reset_tracker",
        description: "Clear all ticks and reset the tracker to factory settings.",
        inputSchema: {
          type: "object",
          properties: {
            confirm: { type: "boolean" },
          },
          required: ["confirm"],
        },
      },
    ],
  };
});

// --- Handle Tool Calls ---
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const data = readData();

  try {
    switch (name) {
      case "init_user": {
        data.initialized = true;
        if (args.useDefault) {
          data.protocols = [...DEFAULT_PROTOCOLS];
        } else if (args.customProtocols && args.customProtocols.length > 0) {
          data.protocols = args.customProtocols.map((p, i) => ({
            id: (i + 1).toString(),
            name: p.name,
            time: p.time || "",
          }));
        } else {
          data.protocols = [...DEFAULT_PROTOCOLS]; // Fallback
        }
        writeData(data);
        return {
          content: [{ type: "text", text: `Tracker initialized successfully! Data stored securely at ${DATA_FILE}.` }],
        };
      }

      case "add_protocol": {
        const newProtocol = { id: generateId(), name: args.name, time: args.time || "" };
        data.protocols.push(newProtocol);
        writeData(data);
        return {
          content: [{ type: "text", text: `Protocol '${args.name}' added successfully. ID: ${newProtocol.id}` }],
        };
      }

      case "remove_protocol": {
        const initialLength = data.protocols.length;
        data.protocols = data.protocols.filter((p) => p.id !== args.id);
        writeData(data);
        return {
          content: [
            {
              type: "text",
              text: data.protocols.length < initialLength ? `Protocol ${args.id} removed.` : `Protocol ${args.id} not found.`,
            },
          ],
        };
      }

      case "set_protocols": {
        data.protocols = args.protocols.map((p) => ({
          id: generateId(),
          name: p.name,
          time: p.time || "",
        }));
        writeData(data);
        return {
          content: [{ type: "text", text: "All protocols have been successfully replaced with your new list." }],
        };
      }

      case "tick_protocol": {
        if (!data.ticks[args.date]) data.ticks[args.date] = [];
        
        const tickSet = new Set(data.ticks[args.date]);
        if (tickSet.has(args.protocol_id)) {
          tickSet.delete(args.protocol_id); // Toggle off if already ticked
        } else {
          tickSet.add(args.protocol_id);
        }
        
        data.ticks[args.date] = Array.from(tickSet);
        writeData(data);
        return {
          content: [{ type: "text", text: `Protocol ${args.protocol_id} status toggled for ${args.date}.` }],
        };
      }

      case "show_tracker": {
        const monthPrefix = args.month; // YYYY-MM
        const relevantDates = Object.keys(data.ticks).filter((d) => d.startsWith(monthPrefix)).sort();
        
        let report = `# Tracker for ${monthPrefix}\n\n`;
        report += `| Date | Protocols Completed (IDs) |\n|---|---|\n`;
        
        if (relevantDates.length === 0) {
          report += `| No data | No ticks for this month |\n`;
        } else {
          relevantDates.forEach((date) => {
            const completed = data.ticks[date].map(id => {
                const p = data.protocols.find(x => x.id === id);
                return p ? p.name : id;
            });
            report += `| ${date} | ${completed.length > 0 ? completed.join(", ") : "None"} |\n`;
          });
        }
        
        report += `\n**Your Active Protocols:**\n`;
        data.protocols.forEach((p) => {
          report += `- [${p.id}] ${p.name} ${p.time ? `(${p.time})` : ""}\n`;
        });

        return { content: [{ type: "text", text: report }] };
      }

      case "show_stats": {
        const totalProtocols = data.protocols.length;
        if (totalProtocols === 0) return { content: [{ type: "text", text: "No protocols set up yet." }] };

        const dates = Object.keys(data.ticks).sort();
        let totalTicks = 0;
        let currentStreak = 0;
        
        for (let i = dates.length - 1; i >= 0; i--) {
            if (data.ticks[dates[i]].length > 0) {
                currentStreak++;
            } else {
                break;
            }
        }

        dates.forEach(date => { totalTicks += data.ticks[date].length; });
        const activeDays = dates.length;
        const possibleTicks = activeDays * totalProtocols;
        const completionRate = possibleTicks === 0 ? 0 : Math.round((totalTicks / possibleTicks) * 100);

        let report = `# PsyroTrack Stats\n`;
        report += `- **Current Streak:** ${currentStreak} days\n`;
        report += `- **Overall Completion Rate:** ${completionRate}%\n`;
        report += `- **Total Ticks:** ${totalTicks}\n`;
        
        return { content: [{ type: "text", text: report }] };
      }

      case "reset_tracker": {
        if (args.confirm) {
          data.ticks = {};
          writeData(data);
          return { content: [{ type: "text", text: "Tracker has been completely reset." }] };
        }
        return { content: [{ type: "text", text: "Reset aborted. Pass confirm: true to actually reset." }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// --- Run Server ---
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("PsyroTrack MCP Server by Psyro8-t running on stdio.");
