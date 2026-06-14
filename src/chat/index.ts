import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const messages: Anthropic.Messages.MessageParam[] = [];

process.stdin.addListener("data", (data) => {
  messages.push({
    role: "user",
    content: data.toString(),
  });

  chat(messages);
});

async function chat(messages: Anthropic.Messages.MessageParam[]) {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 250,
    system: "You are a helpful assistant that provides information.",
    messages,
  });

  const text = response.content
    .map((b) => ("text" in b ? b.text : ""))
    .join("");

  console.log("Claude's response: ", text);

  messages.push({
    role: "assistant",
    content: text,
  });
}
