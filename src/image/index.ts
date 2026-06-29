import Anthropic from "@anthropic-ai/sdk";
import path from "node:path";
import fs from 'fs';

const client = new Anthropic();

const image = fs.readFileSync(
    path.join(process.cwd(), 'public', 'prop1.png')
);

const response = await client.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: image.toString("base64"),
          },
        },
        {
          type: "text",
          text: "What is shown in this image?",
        },
      ],
    },
  ],
});

console.log(response);
