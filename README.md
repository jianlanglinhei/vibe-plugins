# vibe-plugins

AI IDE 配置管理工具 - 基于 [rulesync](https://github.com/dyoshikawa/rulesync) 的预设分发。

## 安装

```bash
npm install -g vibe-plugins
# 或
npx vibe-plugins
```

## 使用

### 1. 安装预设到项目

```bash
# 进入你的项目目录
cd your-project

# 安装跨端开发配置
npx vibe-plugins install cross-platform

# 安装效率工具配置
npx vibe-plugins install productivity
```

### 2. 生成 IDE 配置

```bash
# 生成所有 IDE 配置
npx vibe-plugins generate

# 只生成 Cursor 配置
npx vibe-plugins generate cursor

# 只生成 Claude Code 配置
npx vibe-plugins generate claudecode
```

### 3. 查看可用预设

```bash
npx vibe-plugins list
```

## 预设列表

| 预设 | 说明 |
|------|------|
| `cross-platform` | 跨端开发配置（MCP、规则、命令） |
| `productivity` | 效率工具配置（代码审查、重构） |

## 目录结构

```
presets/
├── cross-platform/     # 跨端开发
│   ├── rules/          # 规则文件
│   ├── commands/       # 命令文件
│   ├── subagents/      # 子代理
│   └── mcp.json        # MCP 配置
└── productivity/       # 效率工具
    ├── rules/
    └── commands/
```

## 工作原理

1. `vibe-plugins install <preset>` 将预设复制到项目的 `.rulesync/` 目录
2. `vibe-plugins generate` 调用 rulesync 生成各 IDE 的配置文件

## 支持的 IDE

- Cursor
- Claude Code
- GitHub Copilot
- Windsurf
- Cline
- Roo

## License

MIT
