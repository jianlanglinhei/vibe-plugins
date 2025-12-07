# Vibe Plugins

A marketplace for custom Claude Code plugins.

## Installation

Add this marketplace to Claude Code:

```bash
/plugin marketplace add jianlanglinhei/vibe-plugins
```

## Available Plugins

- **一码多端插件 (cross-platform)**: 帮助开发者实现跨平台代码开发和部署的工具集
- **效率插件 (productivity)**: 提升开发效率的工具集合，包括代码生成、重构、文档生成等
- **稳定性插件 (stability)**: 提升代码稳定性和可靠性的工具集，包括错误处理、性能监控、测试等
- **无码类插件 (no-code)**: 低代码/无代码开发工具，通过可视化和自然语言生成代码

## Usage

1. Add the marketplace: `/plugin marketplace add jianlanglinhei/vibe-plugins`
2. Browse plugins: `/plugin`
3. Install a plugin: `/plugin install <plugin-name>`

## Creating Your Own Plugin

See the `.claude-plugin/example-plugin/` directory for a template.

### Plugin Structure

```
.claude-plugin/
├── marketplace.json          # Marketplace configuration
└── <plugin-name>/
    ├── plugin.json           # Plugin configuration
    ├── README.md             # Plugin documentation
    ├── commands/             # Slash commands (optional)
    ├── agents/               # Subagents (optional)
    ├── mcp-servers/          # MCP servers (optional)
    └── hooks/                # Hooks (optional)
```

## Learn More

- [Claude Code Plugins Documentation](https://claude.com/blog/claude-code-plugins)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## CLI 安装器

使用仓库内置的 CLI 把插件/MCP 注入到项目，支持 Claude Code、Cursor、qoder 三端。

### 快速开始

```bash
# 安装依赖
npm install

# 自动检测环境并安装 cross-platform 插件
node ./packages/cli/bin/vibe-plugins.js install cross-platform

# 指定环境与目标目录
node ./packages/cli/bin/vibe-plugins.js install cross-platform --env claude --target /path/to/project
```

### 安装方式

#### 方式一：传统文件复制（默认）

直接复制文件到目标项目：

```bash
node ./packages/cli/bin/vibe-plugins.js install cross-platform --env claude
```

#### 方式二：使用 Claude Agent SDK（推荐）

利用 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/typescript) 的能力，让 Claude 自己执行安装：

```bash
node ./packages/cli/bin/vibe-plugins.js install cross-platform --env claude --use-sdk
```

这种方式会：
- 使用 `@anthropic-ai/claude-agent-sdk` 的 `query()` 函数
- 让 Claude 读取插件文件并执行安装
- 利用 Claude Code 的默认工具集进行文件操作
- 提供更智能的安装过程

### 使用已安装的插件

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

### CLI 选项

- `--env <claude|cursor|qoder|auto>`：强制指定环境，默认自动探测
- `--target <path>`：目标项目路径，默认当前目录
- `--dry-run`：仅打印计划，不写入文件
- `--use-sdk`：使用 Claude Agent SDK 执行安装（仅 Claude 环境）

### 环境支持

CLI 会根据环境更新：
- **Claude Code**: `.claude-plugin/<plugin>/plugin.json` 与 MCP 目录
- **Cursor**: `~/.cursor/settings.json`（仅 MCP）
- **qoder**: `qoder.config.json` 与项目目录结构

详细文档请参考：[packages/cli/README.md](packages/cli/README.md)
