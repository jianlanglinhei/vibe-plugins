import os from "os";
import path from "path";
import { pathExists } from "./utils/fs.js";

export async function detectEnv(targetDir) {
  const claudeMarkers = [
    ".claude",
    ".claude-plugin",
    path.join(".vscode", "extensions", "claude.code"),
  ];

  for (const marker of claudeMarkers) {
    if (await pathExists(path.join(targetDir, marker))) {
      return "claude";
    }
  }

  if (await pathExists(path.join(targetDir, "cursor.json"))) {
    return "cursor";
  }

  if (await pathExists(path.join(os.homedir(), ".cursor", "settings.json"))) {
    return "cursor";
  }

  if (await pathExists(path.join(targetDir, "qoder.config.json"))) {
    return "qoder";
  }

  return "unknown";
}

