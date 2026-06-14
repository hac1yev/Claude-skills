import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const system = `
You are a concise assistant.
Rules:
- Answer in max 4–6 short lines
- Do NOT repeat the user question
- Be concrete and direct
- No headings, no markdown, no extra explanation unless necessary
`;
const messages: Anthropic.Messages.MessageParam[] = [];

process.stdin.addListener("data", (data) => {
  messages.push({
    role: "user",
    content: data.toString(),
  });

  streamChat(messages);
});

async function streamChat(messages: Anthropic.Messages.MessageParam[]) {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 100,
    system,
    messages,
    stream: true,
  });

  for await (const event of response) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }
}
