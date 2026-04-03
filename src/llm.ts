import ora from "ora";

const SYSTEM_PROMPT = `You are a pull request description generator. Given a git diff, commit messages, and changed files summary, output ONLY a well-structured PR description in markdown.

Structure:
1. ## Summary — concise overview of what this PR does (2-3 sentences)
2. ## Changes — bulleted list of key changes
3. ## Testing — how to test these changes (if applicable)

Keep it clear, concise, and actionable. No markdown fences, no preamble, just the description.`;

interface GenerateParams {
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
  diff: string;
  commitLog: string;
  changedFiles: string;
  branchName: string;
  template?: string;
}

export async function generateDescription(
  params: GenerateParams,
): Promise<string> {
  const { provider, model, apiKey, diff, commitLog, changedFiles, branchName, template } =
    params;
  const spinner = ora("Generating PR description...").start();

  try {
    let userPrompt = `Branch: ${branchName}\n\n`;

    if (commitLog.trim()) {
      userPrompt += `## Commit messages\n${commitLog}\n\n`;
    }

    if (changedFiles.trim()) {
      userPrompt += `## Changed files\n${changedFiles}\n\n`;
    }

    userPrompt += `## Full diff\n${diff}`;

    if (template) {
      userPrompt += `\n\n## Template to follow\n${template}\n\nFollow the structure of this template but fill in the content based on the diff above.`;
    }

    let message: string;

    if (provider === "openai") {
      message = await callOpenAI(model, apiKey, userPrompt);
    } else {
      message = await callAnthropic(model, apiKey, userPrompt);
    }

    message = message.trim().replace(/^```[\s\S]*?\n?```\s*$/, "").trim();

    spinner.succeed("PR description generated.");
    return message;
  } catch (err) {
    spinner.fail("Failed to generate PR description.");
    throw err;
  }
}

async function callOpenAI(
  model: string,
  apiKey: string,
  prompt: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

async function callAnthropic(
  model: string,
  apiKey: string,
  prompt: string,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content[0]?.text ?? "";
}
