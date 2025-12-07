import path from "path";
import { PLUGINS_ROOT } from "./constants.js";
import { pathExists, readJSON } from "./utils/fs.js";

export async function loadManifest(pluginName) {
  const pluginRoot = path.join(PLUGINS_ROOT, pluginName);
  const pluginJsonPath = path.join(pluginRoot, ".claude-plugin", "plugin.json");
  const installManifestPath = path.join(pluginRoot, "install.json");

  if (!(await pathExists(pluginJsonPath))) {
    throw new Error(
      `Plugin "${pluginName}" not found. Expected at ${pluginJsonPath}`,
    );
  }

  const pluginJson = await readJSON(pluginJsonPath);
  const installJson = (await pathExists(installManifestPath))
    ? await readJSON(installManifestPath)
    : {};

  const manifest = {
    name: pluginJson.name ?? pluginName,
    displayName: pluginJson.displayName,
    description: pluginJson.description,
    version: pluginJson.version,
    // installer-specific metadata
    mcp: installJson.mcp ?? [],
    skills:
      installJson.skills ??
      (pluginJson.skills ? pluginJson.skills.map((s) => s.name) : []),
    commands:
      installJson.commands ??
      (pluginJson.commands ? pluginJson.commands.map((c) => c.name) : []),
    agents:
      installJson.agents ??
      (pluginJson.agents ? pluginJson.agents.map((a) => a.name) : []),
    hooks:
      installJson.hooks ??
      (pluginJson.hooks ? pluginJson.hooks.map((h) => h.name) : []),
    sourceDir: pluginRoot,
  };

  return manifest;
}

