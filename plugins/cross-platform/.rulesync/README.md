# Cross-Platform Plugin (Rulesync Distribution)

此目录包含通过 [rulesync](https://github.com/dyoshikawa/rulesync) 分发的跨端开发插件。

## 安装方式

### 方式一：使用 rulesync CLI

```bash
# 安装 rulesync
npm install -g rulesync

# 在目标项目中生成配置
cd your-project
rulesync generate --targets cursor,claudecode --features "*"
```

### 方式二：手动复制

将 `.rulesync` 目录复制到你的项目根目录，然后运行：

```bash
rulesync generate --targets cursor --features "*"
```

## 目录结构

```
.rulesync/
├── rules/                    # 规则文件
│   └── cross-platform.md     # 跨端开发规范
├── commands/                 # 命令文件
│   └── optimize-bundle.md    # 构建优化命令
├── subagents/                # 子代理
│   └── cross-platform-agent.md
├── skills/                   # 技能
│   └── perf-scan/
│       └── SKILL.md
├── mcp.json                  # MCP 服务配置
└── README.md
```

## 支持的目标平台

- `cursor` - Cursor IDE
- `claudecode` - Claude Code
- `windsurf` - Windsurf
- `cline` - Cline
- `roo` - Roo

## 功能特性

| Feature | 说明 |
|---------|------|
| `rules` | 跨端开发规范 |
| `commands` | `/optimize-bundle` 命令 |
| `subagents` | 跨端协同子代理 |
| `skills` | `perf-scan` 性能体检 |
| `mcp` | o2-space, sls, browser MCP 服务 |

## 使用示例

生成 Cursor 配置（包含所有功能）：

```bash
rulesync generate --targets cursor --features "*"
```

仅生成 Claude Code 的 MCP 配置：

```bash
rulesync generate --targets claudecode --features mcp
```

启用 Modular MCP 以减少 token 消耗：

```bash
rulesync generate --targets claudecode --features mcp --modular-mcp
```

