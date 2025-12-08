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
  "vibe-tools": "vibe-presets 工具链（打标、分析）",
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
    console.error(`❌ 套件 "${preset}" 不存在`);
    console.log(`可用套件: ${Object.keys(PRESETS).join(", ")}`);
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

  // 复制 .aiignore
  const aiignoreSrc = path.join(presetDir, ".aiignore");
  const aiignoreDest = path.join(rulesyncDir, ".aiignore");
  if (fs.existsSync(aiignoreSrc)) {
    fs.copyFileSync(aiignoreSrc, aiignoreDest);
    console.log(`✅ 已复制 .aiignore`);
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

  console.log(`\n🎉 套件 "${preset}" 安装完成！`);
  console.log(`
📝 下一步：生成 IDE 配置

  vp generate cursor      # 生成 Cursor 配置
  vp generate claudecode  # 生成 Claude Code 配置
  vp generate             # 生成所有 IDE 配置

支持的 IDE: cursor, claudecode, copilot, windsurf, cline, roo
`);
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
  console.log("📦 可用套件:\n");
  for (const [name, desc] of Object.entries(PRESETS)) {
    console.log(`  ${name.padEnd(20)} ${desc}`);
  }
}

function tag(entryFile: string): void {
  const resolved = path.resolve(process.cwd(), entryFile);

  if (!fs.existsSync(resolved)) {
    console.error(`❌ 文件不存在: ${resolved}`);
    process.exit(1);
  }

  console.log(`🏷️  分析工具: ${resolved}`);
  console.log("");

  // TODO: 基于 Claude Agent SDK 实现具体分析逻辑
  console.log("📝 待实现: 读取入口文件，分析工具功能，生成标签");
  console.log("");
  console.log("预期输出:");
  console.log("  - 工具名称");
  console.log("  - 功能描述");
  console.log("  - 类型标签 (cli/library/api...)");
  console.log("  - 技术栈标签");
}

function showHelp(): void {
  console.log(`
vp (vibe-presets) - AI IDE 配置管理工具

用法:
  vp install <preset> [target-dir]  安装套件到目标目录
  vp generate [target]              生成 IDE 配置 (cursor/claudecode/*)
  vp list                           列出可用套件
  vp tag <entry-file>               分析工具入口文件，生成标签

示例:
  vp install cross-platform         安装跨端开发配置
  vp generate cursor                生成 Cursor 配置
  vp generate                       生成所有 IDE 配置
  vp tag ./src/index.ts             分析工具并生成标签
`);
}

// CLI 入口
const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case "install":
    if (!args[0]) {
      console.error("用法: vp install <preset> [target-dir]");
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

  case "tag":
    if (!args[0]) {
      console.error("用法: vp tag <entry-file>");
      console.error("示例: vp tag ./src/index.ts");
      process.exit(1);
    }
    tag(args[0]);
    break;

  default:
    showHelp();
}

