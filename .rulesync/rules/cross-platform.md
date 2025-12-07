---
root: false
targets: ['*']
description: "跨端开发规范与最佳实践"
globs: ["**/*"]
---

# 跨端开发规范

## 支持的框架

- React Native
- Flutter
- Uni-app
- Web (React/Vue/Angular)

## 最佳实践

1. **统一状态管理**: 跨端项目应使用统一的状态管理方案
2. **组件抽象**: 将平台差异封装在适配层，业务代码保持一致
3. **性能优先**: 关注启动时长、渲染性能和包体积
4. **渐进式优化**: 使用 `/optimize-bundle` 命令和 `perf-scan` 技能进行体检

## 可用工具

- `/optimize-bundle`: 分析并优化构建产物
- `perf-scan`: 性能体检技能
- MCP 服务: o2-space, sls, browser

