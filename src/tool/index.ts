import Anthropic from "@anthropic-ai/sdk";

function getCurrentDateTime() {
  return new Date().toLocaleString("az-AZ", { timeZone: "Asia/Baku" });
}

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "get_current_datetime",
    description: "Get current date and time in Baku",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

const messages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: "What is the current date and time in Baku?",
  },
];

let response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 100,
    messages,
    tools,
});

const toolUse = response.content?.find((r) => r.type === "tool_use");

if (toolUse) {
    const result = toolUse.name === "get_current_datetime" ? getCurrentDateTime() : null;

    messages.push({
        role: "assistant",
        content: response.content
    });

    messages.push({
        role: "user",
        content: [
            {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: result!
            }
        ]
    });

    response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 100,
        messages,
        tools,
    })
}   

console.log("Final response:", response.content);