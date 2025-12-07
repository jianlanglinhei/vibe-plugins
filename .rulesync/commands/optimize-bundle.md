---
root: false
targets: ['*']
description: "针对跨端构建的体积与性能优化助手"
globs: ["**/*"]
---

# /optimize-bundle

针对跨端构建的体积与性能优化助手。

## 用法

- `/optimize-bundle --target web`：分析 Web 产物体积并给出压缩/分包建议
- `/optimize-bundle --target ios`：检查 iOS 包大小、资源内联、动态库使用情况
- `/optimize-bundle --target android`：检查 Android 包体积、资源压缩、ProGuard 配置

## 行为

1. 收集当前仓库的构建配置（Webpack/Vite/Metro/Gradle/Podfile）
2. 输出风险点与建议的 patch
3. 给出可复制的脚本与配置片段

