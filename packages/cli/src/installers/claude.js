import path from "path";
import { copyIfPresent } from "./shared.js";
import { info, success } from "../logger.js";
import { ensureDirectory, pathExists, readJSON, writeJSON } from "../utils/fs.js";

export async function installForClaude({ manifest, targetDir, dryRun }) {
  const claudeRoot = path.join(targetDir, ".claude-plugin");
  const pluginTarget = path.join(claudeRoot, manifest.name);

  info(`Claude Code detected. Installing into ${pluginTarget}`);

  await ensureDirectory(claudeRoot);

  await copyIfPresent(manifest.sourceDir, pluginTarget, dryRun, "plugin copy");

  if (dryRun) {
    success("Claude installation dry-run finished");
    info(
      `To use this plugin with the Agent SDK, include it in your query options:\n` +
        `    plugins: [{ type: "local", path: "./.claude-plugin/${manifest.name}" }]`,
    );
    return { pluginTarget };
  }

  const pluginJsonPath = path.join(
    pluginTarget,
    ".claude-plugin",
    "plugin.json",
  );
  if (!(await pathExists(pluginJsonPath))) {
    throw new Error(`plugin.json missing after copy: ${pluginJsonPath}`);
  }

  const pluginJson = await readJSON(pluginJsonPath);
  pluginJson.mcpServers = pluginJson.mcpServers ?? [];

  const existing = new Set(pluginJson.mcpServers.map((s) => s.name));
  for (const server of manifest.mcp ?? []) {
    if (existing.has(server)) continue;
    pluginJson.mcpServers.push({
      name: server,
      description: `Installed via vibe-plugins for ${manifest.displayName ?? manifest.name}`,
      command: "node",
      args: [`./mcp/${server}/index.js`],
    });
  }

  if (!dryRun) {
    await writeJSON(pluginJsonPath, pluginJson);
  }

  success("Claude installation finished");
  info(
    `To use this plugin with the Agent SDK, include it in your query options:\n` +
      `    plugins: [{ type: "local", path: "./.claude-plugin/${manifest.name}" }]`,
  );
  return { pluginTarget };
}

