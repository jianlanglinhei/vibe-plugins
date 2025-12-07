import path from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { info, success, warn } from "../logger.js";
import { pathExists, readJSON } from "../utils/fs.js";

/**
 * Install plugin using Claude Agent SDK's capabilities
 * This leverages Claude itself to perform the installation
 */
export async function installForClaudeWithSDK({
  manifest,
  targetDir,
  dryRun,
}) {
  const pluginSourceDir = manifest.sourceDir;
  const claudeRoot = path.join(targetDir, ".claude-plugin");
  const pluginTarget = path.join(claudeRoot, manifest.name);

  info(`Installing ${manifest.displayName ?? manifest.name} using Claude Agent SDK`);
  info(`Source: ${pluginSourceDir}`);
  info(`Target: ${pluginTarget}`);

  // Read plugin.json to understand the structure
  const pluginJsonPath = path.join(pluginSourceDir, ".claude-plugin", "plugin.json");
  if (!(await pathExists(pluginJsonPath))) {
    throw new Error(`Plugin manifest not found: ${pluginJsonPath}`);
  }

  const pluginJson = await readJSON(pluginJsonPath);
  const installManifestPath = path.join(pluginSourceDir, "install.json");
  const installManifest = await pathExists(installManifestPath)
    ? await readJSON(installManifestPath)
    : { mcp: [], skills: [], commands: [], agents: [] };

  // Build installation prompt
  const installationPrompt = buildInstallationPrompt({
    manifest,
    pluginJson,
    installManifest,
    pluginSourceDir,
    pluginTarget,
    dryRun,
  });

  if (dryRun) {
    info("Dry-run mode: Would execute the following installation:");
    console.log("\n" + installationPrompt + "\n");
    success("Dry run complete. No files were written.");
    return { pluginTarget };
  }

  // Use Claude SDK to perform installation
  info("Using Claude Agent SDK to install plugin...");

  try {
    const result = await query({
      prompt: installationPrompt,
      options: {
        cwd: targetDir,
        maxTurns: 5,
        // Load the plugin source directory so Claude can read files
        additionalDirectories: [pluginSourceDir],
        // Use Claude Code's default tools for file operations
        tools: { type: "preset", preset: "claude_code" },
        systemPrompt: {
          type: "preset",
          preset: "claude_code",
          append: `You are installing a Claude Code plugin. Follow the installation instructions precisely.`,
        },
      },
    });

    let lastMessage = null;
    for await (const message of result) {
      if (message.type === "assistant") {
        lastMessage = message;
        if (typeof message.content === "string") {
          info(`Claude: ${message.content.substring(0, 200)}...`);
        }
      }
      if (message.type === "result") {
        info("Installation completed by Claude");
        if (message.usage) {
          info(
            `Tokens used: ${message.usage.inputTokens} input, ${message.usage.outputTokens} output`,
          );
        }
      }
    }

    success("Plugin installed successfully using Claude Agent SDK");
    info(
      `To use this plugin in your code, include it in query options:\n` +
        `    plugins: [{ type: "local", path: "./.claude-plugin/${manifest.name}" }]`,
    );

    return { pluginTarget, lastMessage };
  } catch (error) {
    warn(`SDK installation failed: ${error.message}`);
    throw error;
  }
}

function buildInstallationPrompt({
  manifest,
  pluginJson,
  installManifest,
  pluginSourceDir,
  pluginTarget,
  dryRun,
}) {
  const steps = [];

  steps.push(
    `Install the Claude Code plugin "${manifest.displayName ?? manifest.name}" (v${manifest.version ?? "0.0.0"}) into: ${pluginTarget}`,
  );

  steps.push("\n## Installation Steps:");

  steps.push(
    `1. Copy the entire plugin directory from ${pluginSourceDir} to ${pluginTarget}`,
  );
  steps.push(`   - Ensure the .claude-plugin/plugin.json structure is preserved`);

  if (installManifest.mcp && installManifest.mcp.length > 0) {
    steps.push(`\n2. MCP Servers to install: ${installManifest.mcp.join(", ")}`);
    steps.push(`   - MCP server files are in: ${path.join(pluginSourceDir, "mcp")}`);
    steps.push(`   - Ensure MCP server paths in plugin.json are relative to plugin root`);
  }

  if (installManifest.skills && installManifest.skills.length > 0) {
    steps.push(`\n3. Skills to install: ${installManifest.skills.join(", ")}`);
    steps.push(`   - Skill files are in: ${path.join(pluginSourceDir, "skills")}`);
  }

  if (installManifest.commands && installManifest.commands.length > 0) {
    steps.push(`\n4. Commands to install: ${installManifest.commands.join(", ")}`);
    steps.push(`   - Command files are in: ${path.join(pluginSourceDir, "commands")}`);
  }

  if (installManifest.agents && installManifest.agents.length > 0) {
    steps.push(`\n5. Agents to install: ${installManifest.agents.join(", ")}`);
    steps.push(`   - Agent files are in: ${path.join(pluginSourceDir, "agents")}`);
  }

  steps.push("\n## Plugin Structure:");
  steps.push("The plugin should have this structure:");
  steps.push("```");
  steps.push(`${pluginTarget}/`);
  steps.push(`├── .claude-plugin/`);
  steps.push(`│   └── plugin.json`);
  if (installManifest.mcp?.length > 0) {
    steps.push(`├── mcp/`);
    installManifest.mcp.forEach((mcp) => {
      steps.push(`│   └── ${mcp}/`);
      steps.push(`│       └── index.js`);
    });
  }
  if (installManifest.skills?.length > 0) {
    steps.push(`├── skills/`);
  }
  if (installManifest.commands?.length > 0) {
    steps.push(`├── commands/`);
  }
  if (installManifest.agents?.length > 0) {
    steps.push(`└── agents/`);
  }
  steps.push("```");

  steps.push("\n## Important:");
  steps.push("- Preserve all file permissions and structure");
  steps.push("- Ensure MCP server paths in plugin.json use relative paths");
  steps.push("- Verify the installation by checking that plugin.json exists at the target");

  if (dryRun) {
    steps.push("\n[DRY RUN MODE - Do not actually write files]");
  }

  return steps.join("\n");
}

