import Anthropic from "@anthropic-ai/sdk";

function getCurrentDateTime() {
  return new Date().toLocaleString("az-AZ", { timeZone: "Asia/Baku" });
}

function addDurationToDateTime(days: number, hours: number, minutes: number) {
  const currentDateTime = new Date();
  currentDateTime.setDate(currentDateTime.getDate() + days);
  currentDateTime.setHours(currentDateTime.getHours() + hours);
  currentDateTime.setMinutes(currentDateTime.getMinutes() + minutes);
  return currentDateTime.toLocaleString("az-AZ", { timeZone: "Asia/Baku" });
}

const tools: Anthropic.Tool[] = [
  {
    name: "get_current_datetime",
    description: "Get the current date and time in Baku",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "add_duration_datetime",
    description: "Add a duration (in minutes) to a given datetime",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number" },
        hours: { type: "number" },
        minutes: { type: "number" },
      },
      additionalProperties: false,
    },
  },
];

function toolCallback(toolName: string, toolArgs: any) {
  if (toolName === "get_current_datetime") {
    return getCurrentDateTime();
  } else if (toolName === "add_duration_datetime") {
    const { days = 0, hours = 0, minutes = 0 } = toolArgs;
    return addDurationToDateTime(days, hours, minutes);
  }
}

const client = new Anthropic();

const messages: Anthropic.Messages.MessageParam[] = [
  {
    role: "user",
    content:
      "What will be the datetime when we add 103 day, 22 hours and 13 minutes to current date?",
  },
];

while (true) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    messages,
    tools,
  });

  const content = response.content;

  const toolUses = content.filter((c) => c.type === "tool_use");

  if (toolUses.length === 0) {
    console.log(content);
    break;
  }

  messages.push({
    role: "assistant",
    content,
  });

  for (const toolUse of toolUses) {
    const result = toolCallback(toolUse.name, toolUse.input);

    if (!result) {
      throw new Error(`Tool failed: ${toolUse.name}`);
    }

    messages.push({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: String(result),
        },
      ],
    });
  }
}
