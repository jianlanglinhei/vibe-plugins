import os from "os";
import path from "path";
import { CURSOR_HOME } from "../constants.js";
import { info, success } from "../logger.js";
import { copyIfPresent, upsertArray } from "./shared.js";
import { ensureDirectory, pathExists, readJSON, writeJSON } from "../utils/fs.js";

export async function installForCursor({ manifest, dryRun }) {
  const cursorStore = path.join(CURSOR_HOME, "vibe-plugins", manifest.name);
  const mcpTargetRoot = path.join(cursorStore, "mcp");
  const settingsPath = path.join(CURSOR_HOME, "settings.json");

  info(`Cursor detected. Installing MCP into ${mcpTargetRoot}`);

  await ensureDirectory(mcpTargetRoot);

  const result = { updatedServers: [] };

  for (const server of manifest.mcp ?? []) {
    const source = path.join(manifest.sourceDir, "mcp", server);
    const destination = path.join(mcpTargetRoot, server);
    const copied = await copyIfPresent(
      source,
      destination,
      dryRun,
      `cursor mcp ${server}`,
    );
    if (copied) {
      result.updatedServers.push({ server, destination });
    }
  }

  const settings = (await pathExists(settingsPath))
    ? await readJSON(settingsPath)
    : {};

  settings.mcpServers = settings.mcpServers ?? {};
  for (const entry of result.updatedServers) {
    settings.mcpServers[entry.server] = {
      command: "node",
      args: [path.join(entry.destination, "index.js")],
    };
  }

  if (!dryRun) {
    await ensureDirectory(path.dirname(settingsPath));
    await writeJSON(settingsPath, settings);
  }

  if ((manifest.skills ?? []).length > 0 || (manifest.agents ?? []).length > 0) {
    info("Cursor does not support agents/skills/commands; skipped.");
  }

  success(
    result.updatedServers.length > 0
      ? `Cursor settings updated (${result.updatedServers.length} MCP servers)`
      : "Cursor installation complete (no MCP servers to install)",
  );
  return { cursorStore };
}

