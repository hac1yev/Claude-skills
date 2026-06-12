import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const system = `
You are a concise assistant.
`
const messages: Anthropic.Messages.MessageParam[] = [];

process.stdin.addListener("data", (data) => {
  messages.push({
    role: "user",
    content: data.toString(),
  });

  chat();
});

async function chat() {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 100,
    system,
    messages,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            content: { type: "string" },
          },
          required: ["content"],
          additionalProperties: false,
        }
      }
    }
  });

  console.log(response);
}
