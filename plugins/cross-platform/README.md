# 一码多端插件

帮助开发者实现跨平台代码开发和部署，支持 Web、iOS、Android、小程序等多端统一开发。

## 功能特性

- **跨平台兼容性检查**: 自动检测代码在不同平台的兼容性问题
- **多端代码生成**: 根据统一代码生成各平台特定实现
- **平台差异处理**: 智能处理各平台 API 差异
- **组件库适配**: 支持主流跨平台框架（React Native、Flutter、Uni-app 等）

## 使用方法

### 检查跨平台兼容性
```bash
/platform-check
```

### 生成特定平台代码
```bash
/generate-platform ios
/generate-platform android
/generate-platform web
```

### 同步多平台代码
```bash
/sync-platforms
```

## 支持的框架

- React Native
- Flutter
- Uni-app
- Taro
- Electron
- Cordova

## 安装

```bash
/plugin marketplace add jianlanglinhei/vibe-plugins
/plugin install cross-platform
```
