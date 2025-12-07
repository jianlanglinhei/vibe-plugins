import fs from "fs/promises";
import path from "path";
import { ensureDirectory, pathExists } from "../utils/fs.js";
import { warn } from "../logger.js";

export async function copyIfPresent(source, destination, dryRun, label) {
  if (!(await pathExists(source))) {
    warn(`skip ${label}: ${source} not found`);
    return false;
  }

  if (dryRun) {
    return true;
  }

  await ensureDirectory(path.dirname(destination));
  await fs.rm(destination, { recursive: true, force: true });
  await fs.cp(source, destination, { recursive: true });
  return true;
}

export function upsertArray(list, item, compareKey) {
  const next = Array.isArray(list) ? [...list] : [];
  const idx = next.findIndex((entry) => entry[compareKey] === item[compareKey]);
  if (idx >= 0) {
    next[idx] = { ...next[idx], ...item };
  } else {
    next.push(item);
  }
  return next;
}

