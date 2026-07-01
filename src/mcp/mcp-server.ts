import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Octokit } from "@octokit/rest";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";

dotenv.config();

const transport = new StdioServerTransport();

const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0",
});

const octokit = new Octokit({
  auth: process.env.PERSONAL_ACCESS_TOKEN,
});

server.registerTool(
  "list-repos",
  {
    title: "List GitHub repositories",
    description: "Returns all repositories for the authenticated user",
    inputSchema: {},
  },
  async () => {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser();

    return {
      content: [
        {
          type: "text",
          text: data.map((repo) => repo.name).join("\n"),
        },
      ],
    };
  },
);

await server.connect(transport);