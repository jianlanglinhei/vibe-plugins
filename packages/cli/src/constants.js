import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(currentDir, "../../..");
export const PLUGINS_ROOT = path.join(REPO_ROOT, "plugins");
export const CURSOR_HOME = path.join(os.homedir(), ".cursor");
export const DEFAULT_ENV = "auto";

