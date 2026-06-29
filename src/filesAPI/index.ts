// The Files API lets you upload and manage files to use with the Claude API without re-uploading content with each request.
import Anthropic, { toFile } from "@anthropic-ai/sdk";
import fs from 'fs';
import path from 'node:path';

const client = new Anthropic();

// conver 'csv' file into 'txt'.
const csv = fs.readFileSync(path.join(process.cwd(), "public", "pdf", "streaming.csv"), "utf8");
fs.writeFileSync(path.join(process.cwd(), "public", "text", "streaming.txt"), csv);

// filesAPI only supports application/pdf and text/plain types (pdf, txt). Unsupported files must be uploaded like this. 
const uploaded = await client.beta.files.upload({
  file: await toFile(
    fs.createReadStream(
        path.join(process.cwd(), "public", "text", "streaming.txt")
    ),
    undefined,
    { type: "text/plain" },
  ),
});

const response = await client.beta.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Please summarize this document for me.",
        },
        {
          type: "document",
          source: {
            type: "file",
            file_id: uploaded.id,
          },
        },
      ],
    },
  ],
  betas: ["files-api-2025-04-14"],
});

console.log(response);