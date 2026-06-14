import Anthropic from "@anthropic-ai/sdk";
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
    required: ["path", "newText"],
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

function requireStringInput(input: any, key: string) {
  const value = input?.[key];

  if (typeof value !== "string") {
    throw new Error(`Tool input "${key}" must be a string`);
  }

  return value;
}

function fileFunction(toolName: string, input: any) {
  switch (toolName) {
    case "read_text": {
      const file = fs.readFileSync(requireStringInput(input, "path"), "utf-8");
      return file;
    }

    case "write_text": {
      fs.writeFileSync(
        requireStringInput(input, "path"),
        requireStringInput(input, "newText"),
        "utf-8",
      );
      return { success: true };
    }

    case "replace_text": {
      const path = requireStringInput(input, "path");
      const oldText = requireStringInput(input, "oldText");
      const newText = requireStringInput(input, "newText");
      const file = fs.readFileSync(path, "utf-8");

      const updatedFile = file.replace(oldText, newText);

      fs.writeFileSync(path, updatedFile, "utf-8");

      return { success: true };
    }

    default:
      throw new Error("Unknown tool: " + toolName);
  }
}

const client = new Anthropic();
const tools = [readTextFile, writeTextFile, replaceTextFile];
const messages: Anthropic.Messages.MessageParam[] = [];

async function readAssistantStream(stream: any) {
  const assistantContent = new Map<number, any>();
  const toolInputJson = new Map<number, string>();

  for await (const event of stream) {
    if (event.type === "content_block_delta" && "text" in event.delta) {
      process.stdout.write(event.delta.text);

      const block = assistantContent.get(event.index);
      if (block?.type === "text") {
        block.text += event.delta.text;
      }
    }

    if (
      event.type === "content_block_delta" &&
      event.delta.type === "input_json_delta"
    ) {
      toolInputJson.set(
        event.index,
        (toolInputJson.get(event.index) ?? "") + event.delta.partial_json,
      );
    }

    if (event.type === "content_block_start") {
      const block: any = event.content_block;

      if (block.type === "tool_use") {
        assistantContent.set(event.index, block);
        toolInputJson.set(event.index, "");
      }

      if (block.type === "text") {
        assistantContent.set(event.index, { type: "text", text: "" });
      }
    }
  }

  return [...assistantContent.entries()]
    .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
    .map(([index, block]) => {
      if (block.type !== "tool_use") {
        return block;
      }

      const inputJson = toolInputJson.get(index) ?? "{}";

      return {
        ...block,
        input: inputJson.trim() ? JSON.parse(inputJson) : {},
      };
    });
}

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

  const assistantBlocks = await readAssistantStream(stream);
  const toolUses = assistantBlocks.filter((block) => block.type === "tool_use");

  if (assistantBlocks.length > 0) {
    messages.push({
      role: "assistant",
      content: assistantBlocks,
    });
  }

  for (const tool of toolUses) {
    const result = fileFunction(tool.name, tool.input);    
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
    const finalStream = client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1000,
      messages,
      tools,
    });

    const finalAssistantBlocks = await readAssistantStream(finalStream);

    if (finalAssistantBlocks.length > 0) {
      messages.push({
        role: "assistant",
        content: finalAssistantBlocks,
      });
    }
  }

  process.stdout.write("\n");
});
