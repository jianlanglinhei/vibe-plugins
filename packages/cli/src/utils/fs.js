import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { copy, ensureDir } from "fs-extra";

export async function pathExists(targetPath) {
  try {
    await fsp.access(targetPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJSON(targetPath) {
  const data = await fsp.readFile(targetPath, "utf8");
  return JSON.parse(data);
}

export async function writeJSON(targetPath, value) {
  const normalized = `${JSON.stringify(value, null, 2)}\n`;
  await ensureDir(path.dirname(targetPath));
  await fsp.writeFile(targetPath, normalized, "utf8");
}

export async function copyDir(source, destination) {
  await copy(source, destination, { overwrite: true, errorOnExist: false });
}

export async function ensureDirectory(targetPath) {
  await ensureDir(targetPath);
}

export async function writeFile(targetPath, content) {
  await ensureDir(path.dirname(targetPath));
  await fsp.writeFile(targetPath, content, "utf8");
}

