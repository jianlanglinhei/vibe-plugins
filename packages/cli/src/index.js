import path from "path";
import { Command } from "commander";
import { DEFAULT_ENV } from "./constants.js";
import { detectEnv } from "./env.js";
import { installForClaude } from "./installers/claude.js";
import { installForClaudeWithSDK } from "./installers/claude-sdk.js";
import { installForCursor } from "./installers/cursor.js";
import { installForQoder } from "./installers/qoder.js";
import { generateCapability, generateFromTable, CAPABILITY_TYPES, CATEGORIES } from "./generators/index.js";
import { info, success, warn } from "./logger.js";
import { loadManifest } from "./manifest.js";

export async function main() {
  const program = new Command();

  program.name("vibe-plugins").description("Universal AI plugin installer");

  program
    .command("install <plugin>")
    .alias("add")
    .description("Install a plugin into the current project")
    .option(
      "-t, --target <path>",
      "target project directory",
      process.cwd(),
    )
    .option(
      "-e, --env <env>",
      "force environment: claude|cursor|qoder|auto",
      DEFAULT_ENV,
    )
    .option("--dry-run", "print actions without writing files", false)
    .option(
      "--use-sdk",
      "use Claude Agent SDK to perform installation (Claude only)",
      false,
    )
    .action(async (plugin, options) => {
      await installPlugin(plugin, options);
    });

  // generate 命令：生成新的能力
  program
    .command("generate")
    .alias("gen")
    .alias("new")
    .description("Generate a new capability (prompt/skill/mcp/command/agent/hook)")
    .requiredOption("-n, --name <name>", "capability name (slug, e.g. my-tool)")
    .requiredOption("-d, --display-name <displayName>", "display name (e.g. 我的工具)")
    .requiredOption(
      "-t, --type <type>",
      "capability type: prompt|skill|mcp|slash-command|agent|hook",
    )
    .requiredOption(
      "-c, --category <category>",
      "category: 一码多端|体验优化|效率提升|稳定性|无码类",
    )
    .option("--description <description>", "description of the capability")
    .option("-a, --author <author>", "author/owner name")
    .option("--team <team>", "team name")
    .option("--dry-run", "print actions without writing files", false)
    .action(async (options) => {
      await runGenerate(options);
    });

  // generate-batch 命令：批量生成
  program
    .command("generate-batch <jsonFile>")
    .alias("gen-batch")
    .description("Generate multiple capabilities from a JSON file")
    .option("--dry-run", "print actions without writing files", false)
    .action(async (jsonFile, options) => {
      await runGenerateBatch(jsonFile, options);
    });

  // list-types 命令：列出支持的类型
  program
    .command("list-types")
    .description("List supported capability types and categories")
    .action(() => {
      console.log("\n📦 Supported Capability Types:\n");
      Object.entries(CAPABILITY_TYPES).forEach(([key, value]) => {
        console.log(`  - ${key.padEnd(15)} → ${value}`);
      });
      console.log("\n📁 Supported Categories:\n");
      Object.entries(CATEGORIES).forEach(([key, value]) => {
        console.log(`  - ${value.padEnd(10)} → plugins/${key}/`);
      });
      console.log("");
    });

  await program.parseAsync(process.argv);
}

async function installPlugin(pluginName, options) {
  const targetDir = path.resolve(options.target ?? process.cwd());
  const manifest = await loadManifest(pluginName);

  const env = options.env ?? DEFAULT_ENV;
  const detected =
    env === DEFAULT_ENV ? await detectEnv(targetDir) : env.toLowerCase();

  if (detected === "unknown") {
    throw new Error(
      "Unable to detect environment. Pass --env claude|cursor|qoder explicitly.",
    );
  }

  info(
    `Installing ${manifest.displayName ?? manifest.name} v${
      manifest.version ?? "0.0.0"
    } for ${detected} (target: ${targetDir})`,
  );

  const payload = { manifest, targetDir, dryRun: !!options.dryRun };

  switch (detected) {
    case "claude":
      if (options.useSdk) {
        await installForClaudeWithSDK(payload);
      } else {
        await installForClaude(payload);
      }
      break;
    case "cursor":
      await installForCursor(payload);
      break;
    case "qoder":
      await installForQoder(payload);
      break;
    default:
      throw new Error(`Unknown environment: ${detected}`);
  }

  if (options.dryRun) {
    warn("Dry run complete. No files were written.");
  } else {
    success("Installation complete.");
  }
}

async function runGenerate(options) {
  const {
    name,
    displayName,
    type,
    category,
    description,
    author,
    team,
    dryRun,
  } = options;

  info(`Generating ${type} "${displayName}"...`);

  await generateCapability({
    name,
    displayName,
    description: description || displayName,
    type,
    category,
    author,
    team,
    dryRun,
  });

  if (dryRun) {
    warn("Dry run complete. No files were written.");
  }
}

async function runGenerateBatch(jsonFile, options) {
  const { readJSON } = await import("./utils/fs.js");
  const resolvedPath = path.resolve(jsonFile);

  info(`Loading batch data from: ${resolvedPath}`);

  const items = await readJSON(resolvedPath);

  if (!Array.isArray(items)) {
    throw new Error("JSON file must contain an array of items");
  }

  info(`Found ${items.length} items to generate`);

  const results = await generateFromTable(items, options.dryRun);

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log("");
  success(`Generated: ${succeeded} succeeded, ${failed} failed`);

  if (options.dryRun) {
    warn("Dry run complete. No files were written.");
  }
}

