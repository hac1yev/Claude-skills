import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 1. Test cases
const testCases = [
  {
    input: "Explain JWT in one sentence",
    mustInclude: ["token", "authentication"]
  }
];

// 2. Call AI
async function runPrompt(input: string) {
  const res = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 100,
    messages: [{ role: "user", content: input }]
  });

  const block = res.content?.[0];
  return block && block.type === "text" ? block.text : "";
}

// 3. Simple evaluator
function evaluate(output: string, testCase: any) {
  const text = output.toLowerCase();

  const passed = testCase.mustInclude.every((word: string) =>
    text.includes(word)
  );

  return passed;
}

// 4. Runner
async function runEvaluation() {
  for (const testCase of testCases) {
    const output = await runPrompt(testCase.input);

    const result = evaluate(output, testCase);

    console.log("INPUT:", testCase.input);
    console.log("OUTPUT:", output);
    console.log("RESULT:", result ? "PASS ✅" : "FAIL ❌");
    console.log("-------------");
  }
}

runEvaluation();