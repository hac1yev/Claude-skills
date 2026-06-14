import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 100,
  tools: [
    {
      type: "web_search_20250305",
      name: "web_search",
    },
  ],
  messages: [
    {
      role: "user",
      content:
        "Search how many goals scored by Bruno Fernandes in his entire career at Man United?",
    },
  ],
});

console.log(JSON.stringify(response.content, null, 2));