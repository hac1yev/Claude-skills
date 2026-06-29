import Anthropic from "@anthropic-ai/sdk";
import fs from 'fs';
import path from "node:path";

const client = new Anthropic();

const pdfBase64 = fs.readFileSync(
    path.join(process.cwd(), 'public', 'pdf', 'earth.pdf')
).toString('base64');

const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1000,
    cache_control: { type: "ephemeral" },
    messages: [
        {
            role: 'user',
            content: [
                {
                    type: 'document',
                    source: {
                        media_type: 'application/pdf',
                        type: 'base64',
                        data: pdfBase64
                    },
                    cache_control: { type: "ephemeral" }
                },
                {
                    type: 'text',
                    text: 'How earth athmosphere were formed ?'
                }
            ]
        }
    ]
});

console.log(response);
