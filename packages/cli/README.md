# vibe-plugins CLI

一条命令为 Claude Code / Cursor / qoder 注入 MCP & Skills。

## 快速开始

```bash
pnpm install # 或 npm install
node ./packages/cli/bin/vibe-plugins.js install cross-platform
```

可选参数：
- `--env <claude|cursor|qoder|auto>`：强制指定环境，默认自动探测
- `--target <path>`：目标项目路径，默认当前目录
- `--dry-run`：仅打印计划，不写入文件
- `--use-sdk`：使用 Claude Agent SDK 执行安装（仅 Claude 环境），让 Claude 自己完成安装操作

## 工作流程
1. 自动检测环境标识（`.claude-plugin/`、`cursor.json`、`qoder.config.json`）
2. 读取 `plugins/<name>/install.json`
3. 拷贝 MCP / skills / commands / agents 到目标项目
4. 更新对应的配置文件：
   - Claude Code: `.claude-plugin/<plugin>/plugin.json`
   - Cursor: `~/.cursor/settings.json`
   - qoder: `qoder.config.json`

## 安装方式

### 方式一：传统文件复制（默认）

直接复制文件到目标项目：

```bash
node ./packages/cli/bin/vibe-plugins.js install cross-platform --env claude
```

### 方式二：使用 Claude Agent SDK（推荐）

让 Claude 自己执行安装操作，利用 SDK 的能力：

```bash
node ./packages/cli/bin/vibe-plugins.js install cross-platform --env claude --use-sdk
```

这种方式会：
- 使用 `@anthropic-ai/claude-agent-sdk` 的 `query()` 函数
- 让 Claude 读取插件文件并执行安装
- 利用 Claude Code 的默认工具集进行文件操作
- 提供更智能的安装过程

## 使用已安装的插件

安装完成后，在你的代码中使用 Claude Agent SDK 加载插件：

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "使用跨端插件检查代码兼容性",
  options: {
    plugins: [
      { type: "local", path: "./.claude-plugin/cross-platform" }
    ],
    tools: { type: "preset", preset: "claude_code" }
  }
})) {
  // 处理消息...
}
```

参考示例：
- `packages/cli/examples/use-plugin-with-sdk.js` - 使用已安装的插件
- `packages/cli/examples/install-and-use.js` - 安装并立即使用

## 生成新能力

### 单个生成

```bash
# 生成一个 MCP
node ./packages/cli/bin/vibe-plugins.js generate \
  -n my-tool \
  -d "我的工具" \
  -t mcp \
  -c 一码多端 \
  -a 张三 \
  --team 前端团队

# 生成一个 Slash Command
node ./packages/cli/bin/vibe-plugins.js gen \
  -n auto-fix \
  -d "自动修复工具" \
  -t slash-command \
  -c 一码多端

# 生成一个 Agent
node ./packages/cli/bin/vibe-plugins.js new \
  -n debug-agent \
  -d "调试助手" \
  -t agent \
  -c 一码多端
```

### 批量生成

从 JSON 文件批量生成：

```bash
node ./packages/cli/bin/vibe-plugins.js generate-batch ./my-capabilities.json
```

JSON 文件格式：

```json
[
  {
    "name": "my-tool",
    "displayName": "我的工具",
    "type": "mcp",
    "category": "一码多端",
    "author": "张三",
    "team": "前端团队"
  }
]
```

### 支持的类型和分类

```bash
# 查看支持的类型和分类
node ./packages/cli/bin/vibe-plugins.js list-types
```

**能力类型**：
- `prompt` - Prompt 提示词
- `skill` - Skill 技能（Claude 自动调用）
- `mcp` - MCP Server
- `slash-command` - Slash Command 斜杠命令
- `agent` - Agent 子代理
- `hook` - Hook 钩子

**分类**：
- `一码多端` → `plugins/cross-platform/`
- `体验优化` → `plugins/ux-optimization/`
- `效率提升` → `plugins/productivity/`
- `稳定性` → `plugins/stability/`
- `无码类` → `plugins/no-code/`

## 目前支持的插件
- `cross-platform`：跨端诊断与优化（内置 o2-space、sls、browser 三个 MCP 占位）

