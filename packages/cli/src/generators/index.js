import path from "path";
import { PLUGINS_ROOT } from "../constants.js";
import { ensureDirectory, pathExists, writeJSON, writeFile } from "../utils/fs.js";
import { info, success, warn } from "../logger.js";

/**
 * 能力类型映射
 */
export const CAPABILITY_TYPES = {
  prompt: "Prompt",
  skill: "Skill",
  mcp: "MCP",
  "slash-command": "Slash Command",
  agent: "Agent",
  hook: "Hook",
};

/**
 * 分类映射
 */
export const CATEGORIES = {
  "cross-platform": "一码多端",
  "ux-optimization": "体验优化",
  productivity: "效率提升",
  stability: "稳定性",
  "no-code": "无码类",
};

/**
 * 生成插件/能力的配置
 */
export async function generateCapability(options) {
  const {
    name,
    displayName,
    description,
    type,
    category,
    author,
    team,
    dryRun,
  } = options;

  // 确定目标插件目录
  const categorySlug = getCategorySlug(category);
  const pluginDir = path.join(PLUGINS_ROOT, categorySlug);
  const claudePluginDir = path.join(pluginDir, ".claude-plugin");

  info(`Generating ${type} "${displayName}" in category "${category}"`);
  info(`Target directory: ${pluginDir}`);

  // 确保目录存在
  if (!dryRun) {
    await ensureDirectory(claudePluginDir);
  }

  // 读取或创建 plugin.json
  const pluginJsonPath = path.join(claudePluginDir, "plugin.json");
  let pluginJson = await loadOrCreatePluginJson(pluginJsonPath, categorySlug, category);

  // 根据类型生成对应的文件和配置
  const result = await generateByType({
    type,
    name,
    displayName,
    description,
    author,
    team,
    pluginDir,
    pluginJson,
    dryRun,
  });

  // 更新 plugin.json
  if (!dryRun) {
    await writeJSON(pluginJsonPath, result.pluginJson);
  }

  // 更新 install.json
  const installJsonPath = path.join(pluginDir, "install.json");
  await updateInstallJson(installJsonPath, type, name, dryRun);

  success(`Generated ${type} "${displayName}" successfully!`);
  
  return {
    pluginDir,
    files: result.files,
  };
}

/**
 * 根据分类获取目录名
 */
function getCategorySlug(category) {
  const mapping = {
    "一码多端": "cross-platform",
    "体验优化": "ux-optimization",
    "效率提升": "productivity",
    "稳定性": "stability",
    "无码类": "no-code",
  };
  return mapping[category] || category;
}

/**
 * 加载或创建 plugin.json
 */
async function loadOrCreatePluginJson(pluginJsonPath, slug, category) {
  if (await pathExists(pluginJsonPath)) {
    const { readJSON } = await import("../utils/fs.js");
    return await readJSON(pluginJsonPath);
  }

  return {
    name: slug,
    displayName: `${category}插件`,
    description: `${category}相关的工具集`,
    version: "1.0.0",
    author: "Vibe Team",
    commands: [],
    agents: [],
    mcpServers: [],
    hooks: [],
  };
}

/**
 * 根据类型生成对应的文件
 */
async function generateByType(options) {
  const { type, name, displayName, description, author, team, pluginDir, pluginJson, dryRun } = options;

  const files = [];
  const updatedPluginJson = { ...pluginJson };

  switch (type.toLowerCase()) {
    case "prompt":
      // Prompt 类型：生成 CLAUDE.md 或 prompts 目录下的文件
      const promptFile = await generatePromptFile({
        name,
        displayName,
        description,
        author,
        team,
        pluginDir,
        dryRun,
      });
      files.push(promptFile);
      break;

    case "skill":
      // Skill 类型：生成 skills/<name>/SKILL.md
      const skillFile = await generateSkillFile({
        name,
        displayName,
        description,
        author,
        team,
        pluginDir,
        dryRun,
      });
      files.push(skillFile);
      break;

    case "mcp":
      // MCP 类型：生成 mcp/<name>/index.js
      const mcpFile = await generateMcpFile({
        name,
        displayName,
        description,
        author,
        team,
        pluginDir,
        dryRun,
      });
      files.push(mcpFile);
      // 更新 plugin.json
      updatedPluginJson.mcpServers = updatedPluginJson.mcpServers || [];
      if (!updatedPluginJson.mcpServers.find((s) => s.name === name)) {
        updatedPluginJson.mcpServers.push({
          name,
          description,
          command: "node",
          args: [`./mcp/${name}/index.js`],
        });
      }
      break;

    case "slash-command":
    case "command":
      // Slash Command 类型：生成 commands/<name>.md
      const commandFile = await generateCommandFile({
        name,
        displayName,
        description,
        author,
        team,
        pluginDir,
        dryRun,
      });
      files.push(commandFile);
      // 更新 plugin.json
      updatedPluginJson.commands = updatedPluginJson.commands || [];
      if (!updatedPluginJson.commands.find((c) => c.name === name)) {
        updatedPluginJson.commands.push({
          name,
          description,
        });
      }
      break;

    case "agent":
      // Agent 类型：生成 agents/<name>.md
      const agentFile = await generateAgentFile({
        name,
        displayName,
        description,
        author,
        team,
        pluginDir,
        dryRun,
      });
      files.push(agentFile);
      // 更新 plugin.json
      updatedPluginJson.agents = updatedPluginJson.agents || [];
      if (!updatedPluginJson.agents.find((a) => a.name === name)) {
        updatedPluginJson.agents.push({
          name,
          description,
        });
      }
      break;

    case "hook":
      // Hook 类型：生成 hooks/<name>.js
      const hookFile = await generateHookFile({
        name,
        displayName,
        description,
        author,
        team,
        pluginDir,
        dryRun,
      });
      files.push(hookFile);
      // 更新 plugin.json
      updatedPluginJson.hooks = updatedPluginJson.hooks || [];
      if (!updatedPluginJson.hooks.find((h) => h.name === name)) {
        updatedPluginJson.hooks.push({
          name,
          description,
        });
      }
      break;

    default:
      warn(`Unknown capability type: ${type}`);
  }

  return { pluginJson: updatedPluginJson, files };
}

/**
 * 生成 Prompt 文件
 */
async function generatePromptFile({ name, displayName, description, author, team, pluginDir, dryRun }) {
  const promptsDir = path.join(pluginDir, "prompts");
  const filePath = path.join(promptsDir, `${name}.md`);

  const content = `# ${displayName}

${description}

## 作者
- **负责人**: ${author || "待定"}
- **团队**: ${team || "待定"}

## 使用方法

在对话中引用此 prompt 来获取相关功能。

## Prompt 内容

\`\`\`
请根据以下要求执行 ${displayName} 功能：

1. 分析当前代码或需求
2. 提供优化建议
3. 生成相应的代码或配置

具体实现请根据实际场景调整。
\`\`\`

## 示例

\`\`\`
用户: 请帮我进行 ${displayName}
助手: 好的，我来帮你...
\`\`\`
`;

  if (!dryRun) {
    await ensureDirectory(promptsDir);
    await writeFile(filePath, content);
  }

  info(`  → ${filePath}`);
  return filePath;
}

/**
 * 生成 Skill 文件
 */
async function generateSkillFile({ name, displayName, description, author, team, pluginDir, dryRun }) {
  const skillDir = path.join(pluginDir, "skills", name);
  const filePath = path.join(skillDir, "SKILL.md");

  const content = `# ${displayName}

${description}

## 作者
- **负责人**: ${author || "待定"}
- **团队**: ${team || "待定"}

## 触发条件

当用户需要 ${displayName} 相关功能时，此 Skill 会自动激活。

## 能力描述

此 Skill 提供以下能力：

1. **自动检测**: 识别相关场景
2. **智能分析**: 分析当前状态
3. **优化建议**: 提供改进方案

## 使用示例

\`\`\`
用户请求涉及 ${displayName} 时，Claude 会自动调用此 Skill。
\`\`\`
`;

  if (!dryRun) {
    await ensureDirectory(skillDir);
    await writeFile(filePath, content);
  }

  info(`  → ${filePath}`);
  return filePath;
}

/**
 * 生成 MCP 文件
 */
async function generateMcpFile({ name, displayName, description, author, team, pluginDir, dryRun }) {
  const mcpDir = path.join(pluginDir, "mcp", name);
  const filePath = path.join(mcpDir, "index.js");

  const content = `#!/usr/bin/env node
/**
 * ${displayName}
 * ${description}
 * 
 * 负责人: ${author || "待定"}
 * 团队: ${team || "待定"}
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const server = new Server(
    {
      name: "${name}",
      version: "0.1.0",
      description: "${description}",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // 健康检查工具
  server.setRequestHandler("tools/list", async () => ({
    tools: [
      {
        name: "health",
        description: "健康检查",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "${name}_action",
        description: "${displayName} 主要功能",
        inputSchema: {
          type: "object",
          properties: {
            input: {
              type: "string",
              description: "输入参数",
            },
          },
          required: ["input"],
        },
      },
    ],
  }));

  server.setRequestHandler("tools/call", async (request) => {
    const { name: toolName, arguments: args } = request.params;

    switch (toolName) {
      case "health":
        return {
          content: [{ type: "text", text: "${name} MCP is running" }],
        };
      case "${name}_action":
        // TODO: 实现具体功能
        return {
          content: [{ type: "text", text: \`执行 ${displayName}: \${args.input}\` }],
        };
      default:
        throw new Error(\`Unknown tool: \${toolName}\`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;

  if (!dryRun) {
    await ensureDirectory(mcpDir);
    await writeFile(filePath, content);
  }

  info(`  → ${filePath}`);
  return filePath;
}

/**
 * 生成 Command 文件
 */
async function generateCommandFile({ name, displayName, description, author, team, pluginDir, dryRun }) {
  const commandsDir = path.join(pluginDir, "commands");
  const filePath = path.join(commandsDir, `${name}.md`);

  const content = `# /${name}

${displayName} - ${description}

## 作者
- **负责人**: ${author || "待定"}
- **团队**: ${team || "待定"}

## 使用方法

\`\`\`
/${name} [参数]
\`\`\`

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| target | string | 否 | 目标路径或文件 |

## 功能说明

执行 ${displayName} 功能：

1. 分析当前上下文
2. 执行相应操作
3. 返回结果

## 示例

\`\`\`
/${name}
/${name} ./src
\`\`\`
`;

  if (!dryRun) {
    await ensureDirectory(commandsDir);
    await writeFile(filePath, content);
  }

  info(`  → ${filePath}`);
  return filePath;
}

/**
 * 生成 Agent 文件
 */
async function generateAgentFile({ name, displayName, description, author, team, pluginDir, dryRun }) {
  const agentsDir = path.join(pluginDir, "agents");
  const filePath = path.join(agentsDir, `${name}.md`);

  const content = `# ${displayName}

${description}

## 作者
- **负责人**: ${author || "待定"}
- **团队**: ${team || "待定"}

## 角色定义

你是一个专门负责 ${displayName} 的 AI 助手。

## 能力范围

1. **分析能力**: 深入分析相关问题
2. **执行能力**: 自动执行相关任务
3. **优化能力**: 提供优化建议

## 工作流程

1. 接收用户请求
2. 分析当前状态
3. 制定执行计划
4. 执行并反馈结果

## 使用场景

- 场景 1: ...
- 场景 2: ...

## 注意事项

- 确保操作安全
- 保持代码风格一致
- 及时反馈进度
`;

  if (!dryRun) {
    await ensureDirectory(agentsDir);
    await writeFile(filePath, content);
  }

  info(`  → ${filePath}`);
  return filePath;
}

/**
 * 生成 Hook 文件
 */
async function generateHookFile({ name, displayName, description, author, team, pluginDir, dryRun }) {
  const hooksDir = path.join(pluginDir, "hooks");
  const filePath = path.join(hooksDir, `${name}.js`);

  const content = `/**
 * ${displayName}
 * ${description}
 * 
 * 负责人: ${author || "待定"}
 * 团队: ${team || "待定"}
 */

export default {
  name: "${name}",
  description: "${description}",
  
  // 触发时机: before_tool_use | after_tool_use | on_error | on_complete
  event: "after_tool_use",
  
  // 匹配的工具名称（可选）
  toolMatch: "*",
  
  // Hook 处理函数
  async handler(context) {
    const { toolName, toolInput, toolOutput, error } = context;
    
    // TODO: 实现 Hook 逻辑
    console.log(\`[${name}] Tool \${toolName} executed\`);
    
    // 返回修改后的输出（可选）
    return toolOutput;
  },
};
`;

  if (!dryRun) {
    await ensureDirectory(hooksDir);
    await writeFile(filePath, content);
  }

  info(`  → ${filePath}`);
  return filePath;
}

/**
 * 更新 install.json
 */
async function updateInstallJson(installJsonPath, type, name, dryRun) {
  let installJson = {
    mcp: [],
    skills: [],
    commands: [],
    agents: [],
    hooks: [],
    prompts: [],
  };

  if (await pathExists(installJsonPath)) {
    const { readJSON } = await import("../utils/fs.js");
    installJson = { ...installJson, ...(await readJSON(installJsonPath)) };
  }

  const typeMapping = {
    prompt: "prompts",
    skill: "skills",
    mcp: "mcp",
    "slash-command": "commands",
    command: "commands",
    agent: "agents",
    hook: "hooks",
  };

  const key = typeMapping[type.toLowerCase()];
  if (key && !installJson[key].includes(name)) {
    installJson[key].push(name);
  }

  if (!dryRun) {
    await writeJSON(installJsonPath, installJson);
  }
}

/**
 * 批量生成（从表格数据）
 */
export async function generateFromTable(items, dryRun = false) {
  const results = [];

  for (const item of items) {
    try {
      const result = await generateCapability({
        name: item.name,
        displayName: item.displayName,
        description: item.description || item.displayName,
        type: item.type,
        category: item.category,
        author: item.author,
        team: item.team,
        dryRun,
      });
      results.push({ success: true, item, result });
    } catch (error) {
      results.push({ success: false, item, error: error.message });
      warn(`Failed to generate ${item.displayName}: ${error.message}`);
    }
  }

  return results;
}


