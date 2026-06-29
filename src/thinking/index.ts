import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const response = await client.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 4000,
  thinking: {
    type: "enabled",
    budget_tokens: 2000,
  },
  messages: [
    {
        role: "user",
        content: `
            Given an array of integers, find the length of the longest increasing subsequence.
            Your solution must run in O(n log n) time.

            Example:
            Input: [10,9,2,5,3,7,101,18]
            Output: 4

            Explain your approach step by step and provide JavaScript code.
        `,
    },
  ],
});

console.log(response);
