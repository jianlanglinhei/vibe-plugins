# Vibe Plugins

> AI IDE 配置管理工具 - 基于 rulesync 的预设分发

一键安装 AI 编程助手的规则、命令、MCP 配置，支持 Cursor、Claude Code、Copilot、Windsurf 等多种 IDE。

## 安装

```bash
# 使用 tnpm 安装
tnpm install @ali/vibe-plugins@latest

# 或全局安装
tnpm install -g @ali/vibe-plugins@latest
```

## 快速开始

### 方式一：全局安装后使用（推荐）

```bash
# 全局安装
tnpm install -g @ali/vibe-plugins@latest

# 直接使用命令
vibe-plugins list                         # 查看所有可用预设
vibe-plugins install cross-platform       # 安装预设
vibe-plugins generate cursor              # 生成 Cursor 配置
vibe-plugins generate                     # 生成所有 IDE 配置
```

### 方式二：npx 临时运行

```bash
npx @ali/vibe-plugins install cross-platform
npx @ali/vibe-plugins generate cursor
```

## 可用预设

| 预设名 | 说明 |
|--------|------|
| `cross-platform` | 跨端开发配置（MCP、规则、命令、子代理） |
| `productivity` | 效率工具配置（代码审查、重构等） |

查看所有预设：

```bash
npx @ali/vibe-plugins list
```

## 命令说明

### `install <preset> [target-dir]`

安装预设到目标目录的 `.rulesync/` 文件夹。

```bash
# 安装到当前目录
npx @ali/vibe-plugins install cross-platform

# 安装到指定目录
npx @ali/vibe-plugins install cross-platform ./my-project
```

安装后会复制以下内容：
- `rules/` - AI 规则文件
- `commands/` - 斜杠命令
- `subagents/` - 子代理配置
- `mcp.json` - MCP 服务器配置

### `generate [target]`

使用 rulesync 生成 IDE 配置文件。

```bash
# 生成 Cursor 配置
npx @ali/vibe-plugins generate cursor

# 生成 Claude Code 配置
npx @ali/vibe-plugins generate claudecode

# 生成所有支持的 IDE 配置
npx @ali/vibe-plugins generate
```

支持的 IDE：
- `cursor` - Cursor IDE
- `claudecode` - Claude Code
- `copilot` - GitHub Copilot
- `windsurf` - Windsurf
- `cline` - Cline
- `roo` - Roo

### `list`

列出所有可用预设。

```bash
npx @ali/vibe-plugins list
```

## 预设结构

```
presets/
├── cross-platform/
│   ├── rules/           # AI 规则
│   │   └── overview.md
│   ├── commands/        # 斜杠命令
│   │   └── review-pr.md
│   ├── subagents/       # 子代理
│   │   └── planner.md
│   └── mcp.json         # MCP 配置
└── productivity/
    ├── rules/
    │   └── code-review.md
    └── commands/
        └── refactor.md
```

## 工作流程

```
1. 安装预设 → .rulesync/ 目录
   npx @ali/vibe-plugins install cross-platform

2. 生成 IDE 配置
   npx @ali/vibe-plugins generate cursor

3. 在 IDE 中使用
   - 规则自动生效
   - 使用 /命令 触发功能
```

## 在项目中使用

### 方式一：npx 直接运行

```bash
npx @ali/vibe-plugins install cross-platform
npx @ali/vibe-plugins generate cursor
```

### 方式二：添加到 package.json

```json
{
  "scripts": {
    "setup:ai": "vibe-plugins install cross-platform && vibe-plugins generate cursor"
  },
  "devDependencies": {
    "@ali/vibe-plugins": "^0.1.0"
  }
}
```

然后运行：

```bash
tnpm install
tnpm run setup:ai
```

## 依赖

- [rulesync](https://www.npmjs.com/package/rulesync) - AI IDE 规则同步工具

## License

MIT
