# /tag - 智能标签分析

分析当前项目或工具的作用，自动生成描述和类型标签。

## 使用方法

```
/tag [path]           # 分析指定路径的项目
/tag                  # 分析当前目录
/tag --update         # 分析并更新 package.json
```

## 执行步骤

1. **读取项目信息**
   - 检查 `package.json`、`README.md`、主入口文件
   - 扫描项目目录结构

2. **分析项目类型**
   - 根据依赖判断项目类型（CLI、Library、Web App 等）
   - 识别使用的框架和技术栈

3. **生成标签**
   - 功能标签：`cli`, `library`, `web-app`, `api`, `config-tool`
   - 技术标签：`typescript`, `react`, `node`, `ai`
   - 领域标签：`devtools`, `productivity`, `automation`

4. **输出分析结果**

```yaml
name: vibe-presets
description: AI IDE 配置管理工具，为多种 IDE 快速安装 Rules、Commands、MCP 等配置套件
type: cli-tool
tags:
  - cli
  - config-tool
  - ai
  - devtools
  - productivity
tech_stack:
  - typescript
  - node
  - rulesync
features:
  - 套件安装
  - IDE 配置生成
  - 多 IDE 支持
```

## 示例输出

```
🏷️  项目分析完成

📦 名称: vibe-presets
📝 描述: AI IDE 配置管理工具

🏷️  类型标签:
   • cli-tool (命令行工具)
   • config-manager (配置管理)
   • developer-tools (开发工具)

🔧 技术栈:
   • TypeScript
   • Node.js
   • rulesync

✨ 核心功能:
   • 安装配置套件到 .rulesync/
   • 生成多 IDE 配置文件
   • 支持 Cursor、Claude Code、Copilot 等

💡 建议 keywords (package.json):
   ["cli", "ai", "ide", "cursor", "claude", "config", "rulesync", "devtools"]
```

## 可选：更新 package.json

使用 `--update` 参数自动更新 `package.json` 的 `description` 和 `keywords` 字段。

