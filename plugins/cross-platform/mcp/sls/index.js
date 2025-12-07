#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/stdio-transport";

async function main() {
  const server = new Server(
    {
      name: "sls",
      version: "0.1.0",
      description: "Placeholder SLS MCP server",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.tool(
    {
      name: "health",
      description: "Basic health check",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    async () => ({
      content: [{ type: "text", text: "sls mcp alive" }],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

