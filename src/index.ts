#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { Command } from "commander";
import { getConfig, type Config } from "./config.js";
import { getBranchDiff, getCurrentBranch, getCommitLog, getChangedFiles } from "./git.js";
import { generateDescription } from "./llm.js";

const program = new Command();

program
  .name("gitprgen")
  .description("AI-powered PR description generator from git diffs")
  .version("1.0.0")
  .option("-p, --provider <provider>", "LLM provider (openai, anthropic)")
  .option("-m, --model <model>", "LLM model to use")
  .option("-b, --base <branch>", "base branch to diff against", "main")
  .option("-t, --template <path>", "custom PR template file")
  .action(async (opts) => {
    const config: Config = getConfig();

    const provider = opts.provider ?? config.provider;
    const model = opts.model ?? config.model;

    if (!provider || !model) {
      console.error(
        "Error: Set provider and model via flags or ~/.gitprgen.json",
      );
      process.exit(1);
    }

    const apiKeyEnv =
      provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY";
    const apiKey = process.env[apiKeyEnv];
    if (!apiKey) {
      console.error(`Error: ${apiKeyEnv} not set`);
      process.exit(1);
    }

    const branch = getCurrentBranch();
    if (!branch) {
      console.error("Error: Not in a git repository");
      process.exit(1);
    }
    if (branch === opts.base) {
      console.error(`Error: Currently on ${opts.base}. Switch to a feature branch first.`);
      process.exit(1);
    }

    let template: string | undefined;
    if (opts.template) {
      try {
        template = readFileSync(opts.template, "utf-8");
      } catch {
        console.error(`Error: Cannot read template file: ${opts.template}`);
        process.exit(1);
      }
    }

    const diff = getBranchDiff(opts.base);
    if (!diff.trim()) {
      console.error(
        `Error: No diff between ${opts.base} and ${branch}. Make sure you have commits on this branch.`,
      );
      process.exit(1);
    }

    const commitLog = getCommitLog(opts.base);
    const changedFiles = getChangedFiles(opts.base);

    const description = await generateDescription({
      provider,
      model,
      apiKey,
      diff,
      commitLog,
      changedFiles,
      branchName: branch,
      template,
    });

    console.log(description);
  });

program.parse();
