#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PRESETS_DIR = path.join(ROOT, "presets");

interface McpConfig {
  mcpServers: Record<string, unknown>;
}

const PRESETS: Record<string, string> = {
  "cross-platform": "跨端开发配置（MCP、规则、命令）",
  "productivity": "效率工具配置",
};

function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function install(preset: string, targetDir: string = process.cwd()): void {
  const presetDir = path.join(PRESETS_DIR, preset);
  if (!fs.existsSync(presetDir)) {
    console.error(`❌ 预设 "${preset}" 不存在`);
    console.log(`可用预设: ${Object.keys(PRESETS).join(", ")}`);
    process.exit(1);
  }

  const rulesyncDir = path.join(targetDir, ".rulesync");
  fs.mkdirSync(rulesyncDir, { recursive: true });

  // 复制各个子目录
  for (const subdir of ["rules", "commands", "subagents", "skills"]) {
    const src = path.join(presetDir, subdir);
    const dest = path.join(rulesyncDir, subdir);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      console.log(`✅ 已复制 ${subdir}/`);
    }
  }

  // 合并 mcp.json
  const mcpSrc = path.join(presetDir, "mcp.json");
  const mcpDest = path.join(rulesyncDir, "mcp.json");
  if (fs.existsSync(mcpSrc)) {
    let mcpConfig: McpConfig = { mcpServers: {} };
    if (fs.existsSync(mcpDest)) {
      mcpConfig = JSON.parse(fs.readFileSync(mcpDest, "utf-8"));
    }
    const newMcp: McpConfig = JSON.parse(fs.readFileSync(mcpSrc, "utf-8"));
    mcpConfig.mcpServers = { ...mcpConfig.mcpServers, ...newMcp.mcpServers };
    fs.writeFileSync(mcpDest, JSON.stringify(mcpConfig, null, 2));
    console.log(`✅ 已合并 mcp.json`);
  }

  console.log(`\n🎉 预设 "${preset}" 安装完成！`);
  console.log(`\n下一步：运行 npx vibe-plugins generate 生成 IDE 配置`);
}

function generate(target: string = "*"): void {
  console.log(`🔄 生成 ${target} 配置...`);
  try {
    execSync(`npx rulesync generate --targets ${target} --features '*'`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch {
    console.error("❌ 生成失败，请确保已安装 rulesync");
    process.exit(1);
  }
}

function list(): void {
  console.log("📦 可用预设:\n");
  for (const [name, desc] of Object.entries(PRESETS)) {
    console.log(`  ${name.padEnd(20)} ${desc}`);
  }
}

function showHelp(): void {
  console.log(`
vibe-plugins - AI IDE 配置管理工具

用法:
  vibe-plugins install <preset> [target-dir]  安装预设到目标目录
  vibe-plugins generate [target]              生成 IDE 配置 (cursor/claudecode/*)
  vibe-plugins list                           列出可用预设

示例:
  npx vibe-plugins install cross-platform     安装跨端开发配置
  npx vibe-plugins generate cursor            生成 Cursor 配置
  npx vibe-plugins generate                   生成所有 IDE 配置
`);
}

// CLI 入口
const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case "install":
    if (!args[0]) {
      console.error("用法: vibe-plugins install <preset> [target-dir]");
      list();
      process.exit(1);
    }
    install(args[0], args[1] || process.cwd());
    break;

  case "generate":
    generate(args[0] || "*");
    break;

  case "list":
    list();
    break;

  default:
    showHelp();
}

