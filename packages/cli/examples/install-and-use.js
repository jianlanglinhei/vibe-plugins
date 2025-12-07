#!/usr/bin/env node
/**
 * Example: Install plugin and immediately use it with SDK
 * 
 * This demonstrates a complete workflow:
 * 1. Install a plugin using the SDK installation method
 * 2. Immediately load and use the plugin in a query
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import path from "path";
import { fileURLToPath } from "url";
import { installForClaudeWithSDK } from "../src/installers/claude-sdk.js";
import { loadManifest } from "../src/manifest.js";
import { PLUGINS_ROOT } from "../src/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function installAndUse(pluginName, targetDir) {
  console.log(`\n=== Step 1: Install Plugin ===\n`);
  
  // Load plugin manifest
  const manifest = await loadManifest(pluginName);
  const resolvedTarget = path.resolve(targetDir);

  // Install using SDK
  await installForClaudeWithSDK({
    manifest,
    targetDir: resolvedTarget,
    dryRun: false,
  });

  console.log(`\n=== Step 2: Use Installed Plugin ===\n`);

  // Plugin path after installation
  const pluginPath = path.join(resolvedTarget, ".claude-plugin", pluginName);

  // Use the plugin in a query
  console.log(`Querying Claude with plugin: ${pluginName}...\n`);

  for await (const message of query({
    prompt: `You have access to the ${manifest.displayName ?? pluginName} plugin. ` +
            `Please list all available commands and explain what they do.`,
    options: {
      cwd: resolvedTarget,
      plugins: [
        { type: "local", path: pluginPath }
      ],
      tools: { type: "preset", preset: "claude_code" },
      systemPrompt: {
        type: "preset",
        preset: "claude_code"
      },
      maxTurns: 2
    }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log("✓ Plugin loaded successfully");
      console.log(`  Available commands: ${message.slash_commands?.filter(cmd => cmd.includes(pluginName)).join(", ") || "none"}\n`);
    }

    if (message.type === "assistant") {
      if (typeof message.content === "string") {
        console.log(message.content);
      } else if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (block.type === "text") {
            console.log(block.text);
          }
        }
      }
    }
  }

  console.log("\n=== Complete ===\n");
}

// Run example
const pluginName = process.argv[2] || "cross-platform";
const targetDir = process.argv[3] || path.join(__dirname, "..", "..", "test-install");

installAndUse(pluginName, targetDir).catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

