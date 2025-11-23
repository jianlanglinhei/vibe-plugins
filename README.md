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
