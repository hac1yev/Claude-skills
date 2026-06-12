import Anthropic from "@anthropic-ai/sdk";
import type { RawContentBlockDelta } from "@anthropic-ai/sdk/resources";
import fs from "fs";

const readTextFile: Anthropic.Tool = {
  name: "read_text",
  description: "Read text inside a file",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string" },
    },
    required: ["path"],
  },
};

const writeTextFile: Anthropic.Tool = {
  name: "write_text",
  description: "Write text inside a file",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string" },
      newText: { type: "string" },
    },
    required: ["newText"],
  },
};

const replaceTextFile: Anthropic.Tool = {
  name: "replace_text",
  description: "Replace old text with new one inside a file",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string" },
      newText: { type: "string" },
      oldText: { type: "string" },
    },
    required: ["path", "newText", "oldText"],
  },
};

function fileFunction(toolName: string, input: any) {
  switch (toolName) {
    case "read_text": {
      const file = fs.readFileSync(input?.path, "utf-8");
      return file;
    }

    case "write_text": {
      fs.writeFileSync(input?.path, input.newText ?? "", "utf-8");
      return { success: true };
    }

    case "replace_text": {
      const file = fs.readFileSync(input?.path, "utf-8");

      const updatedFile = file.replace(
        input.oldText ?? "",
        input.newText ?? "",
      );

      fs.writeFileSync(input?.path, updatedFile, "utf-8");

      return { success: true };
    }

    default:
      throw new Error("Unknown tool: " + toolName);
  }
}

const client = new Anthropic();
const tools = [readTextFile, writeTextFile, replaceTextFile];
const messages: Anthropic.Messages.MessageParam[] = [];

process.stdin.addListener("data", async (chunk) => {
  const input = chunk.toString();

  messages.push({
    role: "user",
    content: input,
  });

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1000,
    messages,
    tools,
  });

  let toolUses: any[] = [];

  for await (const event of stream) {
    if (event.type === "content_block_delta" && "text" in event.delta) {
      process.stdout.write(event.delta.text);
    }

    if (event.type === "content_block_start") {
      const block: any = event.content_block;

      if (block.type === "tool_use") {
        toolUses.push(block);
      }
    }
  }
  
  for (const tool of toolUses) {

    const result = fileFunction(tool.name, tool.input);
    console.log(result);
    
    messages.push({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: tool.id,
          content: JSON.stringify(result),
        },
      ],
    });
  }

  if (toolUses.length > 0) {
    const final = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1000,
      messages,
      tools,
    });

    console.log("\n💬 FINAL:", final.content);
  }
});