import path from "path";
import { info, success } from "../logger.js";
import { copyIfPresent, upsertArray } from "./shared.js";
import { ensureDirectory, pathExists, readJSON, writeJSON } from "../utils/fs.js";

export async function installForQoder({ manifest, targetDir, dryRun }) {
  const mcpRoot = path.join(targetDir, "mcp", manifest.name);
  const skillsRoot = path.join(targetDir, "skills");
  const commandsRoot = path.join(targetDir, "commands");
  const agentsRoot = path.join(targetDir, "agents");
  const configPath = path.join(targetDir, "qoder.config.json");

  info(`qoder detected. Installing into ${targetDir}`);

  await ensureDirectory(mcpRoot);

  for (const server of manifest.mcp ?? []) {
    const source = path.join(manifest.sourceDir, "mcp", server);
    const destination = path.join(mcpRoot, server);
    await copyIfPresent(source, destination, dryRun, `qoder mcp ${server}`);
  }

  for (const skill of manifest.skills ?? []) {
    const source = path.join(manifest.sourceDir, "skills", skill);
    const destination = path.join(skillsRoot, skill);
    await copyIfPresent(source, destination, dryRun, `qoder skill ${skill}`);
  }

  for (const command of manifest.commands ?? []) {
    const source = path.join(manifest.sourceDir, "commands", `${command}.md`);
    const destination = path.join(commandsRoot, `${command}.md`);
    await copyIfPresent(
      source,
      destination,
      dryRun,
      `qoder command ${command}`,
    );
  }

  for (const agent of manifest.agents ?? []) {
    const source = path.join(manifest.sourceDir, "agents", `${agent}.md`);
    const destination = path.join(agentsRoot, `${agent}.md`);
    await copyIfPresent(source, destination, dryRun, `qoder agent ${agent}`);
  }

  const config = (await pathExists(configPath))
    ? await readJSON(configPath)
    : {};

  config.mcp = config.mcp ?? [];
  for (const server of manifest.mcp ?? []) {
    config.mcp = upsertArray(
      config.mcp,
      {
        name: server,
        command: "node",
        args: [`./mcp/${manifest.name}/${server}/index.js`],
      },
      "name",
    );
  }

  if (manifest.skills?.length) {
    config.skills = config.skills ?? [];
    for (const skill of manifest.skills) {
      if (!config.skills.includes(skill)) {
        config.skills.push(skill);
      }
    }
  }

  if (manifest.commands?.length) {
    config.commands = config.commands ?? [];
    for (const command of manifest.commands) {
      if (!config.commands.includes(command)) {
        config.commands.push(command);
      }
    }
  }

  if (manifest.agents?.length) {
    config.agents = config.agents ?? [];
    for (const agent of manifest.agents) {
      if (!config.agents.includes(agent)) {
        config.agents.push(agent);
      }
    }
  }

  if (!dryRun) {
    await writeJSON(configPath, config);
  }

  success("qoder installation finished");
  return { configPath };
}

