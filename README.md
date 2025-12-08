# Vibe Presets


为 Cursor、Claude Code、Copilot、Windsurf 等 AI IDE 快速安装 Rules、Commands、MCP 等配置套件。

## 安装

```bash
# 使用 tnpm 安装
tnpm install @ali/vibe-presets@latest

# 或全局安装
tnpm install -g @ali/vibe-presets@latest
```

## 快速开始

### 方式一：全局安装后使用（推荐）

```bash
# 全局安装
tnpm install -g @ali/vibe-presets@latest

# 直接使用命令
vp list                         # 查看所有可用套件
vp install cross-platform       # 安装套件
vp generate cursor              # 生成 Cursor 配置
vp generate                     # 生成所有 IDE 配置
```

### 方式二：npx 临时运行（无需安装）

```bash
npx @ali/vibe-presets install cross-platform
npx @ali/vibe-presets generate cursor
# 或使用简写
npx @ali/vibe-presets list
```

## 可用套件

| 套件名 | 说明 |
|--------|------|
| `cross-platform` | 跨端开发配置（MCP、规则、命令、子代理） |
| `productivity` | 效率工具配置（代码审查、重构等） |

查看所有套件：

```bash
vp list
```

## 命令说明

### `install <preset> [target-dir]`

安装套件到目标目录的 `.rulesync/` 文件夹。

```bash
# 安装到当前目录
vp install cross-platform

# 安装到指定目录
vp install cross-platform ./my-project
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
vp generate cursor

# 生成 Claude Code 配置
vp generate claudecode

# 生成所有支持的 IDE 配置
vp generate
```

支持的 IDE：
- `cursor` - Cursor IDE
- `claudecode` - Claude Code
- `copilot` - GitHub Copilot
- `windsurf` - Windsurf
- `cline` - Cline
- `roo` - Roo

### `list`

列出所有可用套件。

```bash
vp list
```

## 套件结构

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
1. 安装套件 → .rulesync/ 目录
   vp install cross-platform

2. 生成 IDE 配置
   vp generate cursor

3. 在 IDE 中使用
   - 规则自动生效
   - 使用 /命令 触发功能
```

## 在项目中使用

### 方式一：全局命令

```bash
vp install cross-platform
vp generate cursor
```

### 方式二：添加到 package.json

```json
{
  "scripts": {
    "setup:ai": "vp install cross-platform && vp generate cursor"
  },
  "devDependencies": {
    "@ali/vibe-presets": "^0.1.0"
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
