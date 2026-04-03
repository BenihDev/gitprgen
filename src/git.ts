import { execSync } from "node:child_process";

export function getBranchDiff(baseBranch: string): string {
  try {
    return execSync(`git diff ${baseBranch}...HEAD`, { encoding: "utf-8" });
  } catch {
    return "";
  }
}

export function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return "";
  }
}

export function getCommitLog(baseBranch: string): string {
  try {
    return execSync(
      `git log ${baseBranch}...HEAD --pretty=format:"%s" --no-merges`,
      { encoding: "utf-8" },
    );
  } catch {
    return "";
  }
}

export function getChangedFiles(baseBranch: string): string {
  try {
    return execSync(`git diff ${baseBranch}...HEAD --stat`, {
      encoding: "utf-8",
    });
  } catch {
    return "";
  }
}
