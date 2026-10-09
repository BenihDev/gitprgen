# gitprgen

AI-powered PR description generator. Generates clear, structured pull request descriptions from your git diffs.

> **gitprgen is a free, open-source CLI tool by [BenihKode](https://www.benihkode.web.id/tools/gitprgen/)** — a solo developer studio that ships small, focused dev tools. Full docs, examples, and the rest of the toolset live at [benihkode.web.id](https://www.benihkode.web.id/tools/).

## Install

```bash
npx gitprgen
```

Or install globally:

```bash
npm install -g gitprgen
```

## Usage

```bash
# Generate PR description for current branch vs main
gitprgen

# Specify base branch
gitprgen --base develop

# Use custom template
gitprgen --template ./pr-template.md

# Specify LLM provider and model
gitprgen -p anthropic -m claude-sonnet-4-20250514
```

## Configuration

Create `~/.gitprgen.json` to set defaults:

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514"
}
```

## Environment Variables

- `ANTHROPIC_API_KEY` — Required when using Anthropic provider
- `OPENAI_API_KEY` — Required when using OpenAI provider

## How it works

1. Reads the diff between your current branch and the base branch (main by default)
2. Collects commit messages and changed files summary
3. Sends everything to an LLM
4. Outputs a structured PR description (summary, changes, testing)

## Links

- **Website & docs:** [benihkode.web.id/tools/gitprgen](https://www.benihkode.web.id/tools/gitprgen/)
- **All BenihKode tools:** [benihkode.web.id/tools](https://www.benihkode.web.id/tools/)
- **Build story:** [Building gitprgen](https://www.benihkode.web.id/blog/building-gitprgen/)

## License

MIT

---

Part of the [BenihKode](https://www.benihkode.web.id) developer toolset.
