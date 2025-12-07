#!/usr/bin/env node
/**
 * Example: Using installed plugins with Claude Agent SDK
 * 
 * This demonstrates how to load and use plugins installed via vibe-plugins CLI
 * with the Claude Agent SDK's query() function.
 * 
 * Reference: https://platform.claude.com/docs/en/agent-sdk/typescript
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Path to the installed plugin (relative to this script or project root)
  const pluginPath = path.join(__dirname, "..", "..", ".claude-plugin", "cross-platform");

  console.log(`Loading plugin from: ${pluginPath}`);
  console.log("Querying Claude with plugin capabilities...\n");

  // Query Claude with the plugin loaded
  for await (const message of query({
    prompt: "What custom commands and capabilities do you have available from the cross-platform plugin?",
    options: {
      // Load the plugin using SDK's plugin system
      plugins: [
        { type: "local", path: pluginPath }
      ],
      // Use Claude Code's default tools
      tools: { type: "preset", preset: "claude_code" },
      // Use Claude Code's system prompt
      systemPrompt: {
        type: "preset",
        preset: "claude_code"
      },
      maxTurns: 3
    }
  })) {
    // Check for system initialization message
    if (message.type === "system" && message.subtype === "init") {
      console.log("=== System Initialization ===");
      console.log("Loaded plugins:", message.plugins);
      console.log("Available commands:", message.slash_commands);
      console.log("");
    }

    // Display assistant responses
    if (message.type === "assistant") {
      if (typeof message.content === "string") {
        console.log("Claude:", message.content);
      } else if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (block.type === "text") {
            console.log("Claude:", block.text);
          }
        }
      }
    }

    // Display final result
    if (message.type === "result") {
      console.log("\n=== Query Complete ===");
      if (message.usage) {
        console.log(`Tokens: ${message.usage.inputTokens} input, ${message.usage.outputTokens} output`);
        if (message.usage.costUSD) {
          console.log(`Cost: $${message.usage.costUSD.toFixed(4)}`);
        }
      }
    }
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

