import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import Anthropic from "@anthropic-ai/sdk";

export const mcp = new Client({
  name: "my-mcp-client",
  version: "1.0.0",
});

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "src/mcp/mcp-server.ts"],
});

await mcp.connect(transport);

const client = new Anthropic();

const { tools } = await mcp.listTools();

const anthropicTools: Anthropic.Tool[] = tools.map((tool) => ({
  name: tool.name,
  description: tool.description ?? "",
  input_schema: {
    ...tool.inputSchema,
    required: tool.inputSchema.required ?? null,
  },
}));

const response = await client.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content:
        "List all the repositories for the authenticated user using the GitHub API and return them in a list.",
    },
  ],
  tools: anthropicTools,
});

const toolUse = response.content?.find((r) => r.type === "tool_use");

if (toolUse) {
  const result = await mcp.callTool({
    name: toolUse.name,
    arguments: toolUse.input as { [x: string]: unknown } | undefined,
  });

  console.log(result);
}
