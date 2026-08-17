---
title: "TrueForge: The Open-Source Agent Harness for LLM Apps"
date: 2026-08-18
tags: [ai-agents, agent-harness, llm, mcp, typescript, sandboxing, open-source]
description: "TrueForge is an open-source agent harness that runs the LLM agent loop — model calls, MCP tools, skills, sandboxing, approvals — from local to production."
---

# TrueForge: The Open-Source Agent Harness for LLM Apps

> **TL;DR**: TrueForge is an open-source agent harness that runs the LLM execution loop for you — model calls, MCP tools, skills, sandboxing, approvals, and session state — exposed as a chat UI, an HTTP API with TypeScript SDK, and an embeddable UI. It scales from a one-process SQLite local mode to Postgres-backed production, and [trended on GitHub](https://trendshift.io/repositories/155463) on August 18, 2026.

![TrueForge — open-source agent harness](https://repository-images.githubusercontent.com/1309751899/ba789678-a68b-4344-ba9a-fcdcd498f6b5)

*The TrueForge agent harness — trending on GitHub August 18, 2026*

## You've Built an Agent. Now Make It Survive.

Getting an LLM to call a function is easy. Everyone's done it. The hard part starts when you need **streaming responses, session persistence, tool servers, sandboxing, approvals, and a UI** — all at once, without duct-taping five libraries together.

That's the gap [TrueForge](https://github.com/truefoundry/trueforge) fills. It's the runtime layer that turns an LLM into a working agent, and it does it out of the box.

## What Is TrueForge?

TrueForge is an open-source **agent harness** — a runtime that runs the agent execution loop for you: model calls, MCP tools, skills, sandboxing, approvals, context management, and session state. It exposes the same engine three ways:

- **Chat UI** — a bundled interface for humans to talk to agents
- **HTTP API + TypeScript SDK** — automate and integrate agents programmatically
- **Embeddable UI SDK** — drop an agent UI into your own app

It scales down and up: **local mode** (one process, SQLite) or **hosted mode** (Postgres + Redis, Docker Compose or Helm). MIT-licensed, from [TrueFoundry](https://github.com/truefoundry).

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-primary text-2xl">MIT</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Open source</div>
  </div>
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-secondary text-2xl">4×</div>
    <div class="stat-desc text-flexoki-subtle text-sm">npm packages</div>
  </div>
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-success text-2xl">Node 22+</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Runtime requirement</div>
  </div>
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-accent text-2xl">2 modes</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Local SQLite / hosted</div>
  </div>
</div>

## The Problem It Solves

The [landscape of AI-powered software development](https://rizperdana.github.io/blog/post.html?slug=code-generation-llms-benchmark) has exploded, but most teams hit the same wall: **building the agent is the easy 20% — running it well is the hard 80%.**

You need:
- **Streaming** — responses that feel responsive, not 30-second hangs
- **Tool access** — MCP servers with auth, not hardcoded function calls
- **Safety** — sandboxed code execution with approvals, not a production box with an API key
- **Memory** — session state, context compaction, subagents
- **Observability** — one ledger for every LLM call, so you know what it costs

TrueForge ships all of these as primitives.

<div class="alert alert-info my-6 flex items-start gap-3 rounded-xl border border-flexoki-info/30 bg-flexoki-info/10 p-4">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 text-flexoki-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <div>
    <h3 class="font-bold text-flexoki-text">Agent harness ≠ agent framework</h3>
    <div class="text-sm text-flexoki-muted mt-1">Frameworks give you an orchestration API. A harness gives you the <strong>execution runtime</strong> — the loop, the sandbox, the approvals — so your code stays your own.</div>
  </div>
</div>

## Key Features

- **Any model provider** — OpenAI, Anthropic, Google Gemini, or any OpenAI-compatible endpoint
- **MCP tools** — remote MCP servers with header auth or OAuth, including in-chat authorization flows
- **Skills** — git-backed `SKILL.md` instruction packs, loaded on demand in the sandbox
- **Sandbox as a tool** — isolated code/file execution (Daytona today, more providers planned), provisioned only when needed; secrets stay in the harness
- **Human checkpoints** — tool approval, ask-user-questions, even Generative UI rendered in chat
- **Context engineering** — subagents, deferred tool loading, Code Mode, large-result offloading, compaction
- **Catalog-driven setup** — configure models, MCP servers, skills, and sandbox once from shipped YAML catalogs

## Getting Started

Local mode runs in one process with SQLite — no Postgres, no Redis, no Docker:

```bash
npx @truefoundry/trueforge@latest
```

Open the chat UI, connect a model, and build your first agent. For a team deployment, run hosted mode instead:

```bash
# Docker Compose or Helm
docker compose up -d
```

Then drive agents programmatically with the TypeScript SDK:

```typescript
import { TrueForgeClient } from "@truefoundry/trueforge-sdk";

const tf = new TrueForgeClient({ baseUrl: "http://localhost:8080" });

const session = await tf.sessions.create({ agent: "my-agent" });
const turn = await tf.turns.create(session.id, {
  text: "Summarize the latest release notes",
});
```

### Local vs Hosted

| Mode | Best for | Storage | Extra infra | How to run |
|------|----------|---------|-------------|------------|
| Local | Personal use, trying it out | SQLite | None | `npx @truefoundry/trueforge` |
| Hosted | Teams, multi-replica | Postgres | Postgres + Redis | Docker Compose / Helm |

> Local mode is for your machine only — no login by default, data in a local SQLite file. For shared or production use, run hosted mode.

## Benchmarks: Same Accuracy, Lower Cost

TrueForge publishes [benchmarks](https://trueforge.dev/benchmarking) comparing itself against **Claude Managed Agents** and **deepagents** on the same tasks, tools, and model — claiming **same accuracy at lower cost**. The harness's context engineering (deferred tool loading, compaction, large-result offloading) is what keeps token spend down.

Numbers like this matter for the same reason [structured output and validation](https://rizperdana.github.io/blog/post.html?slug=building-reliable-llm-pipelines-with-structured-output) matter: reliability is a cost function, and the cheapest reliable pipeline wins in production.

## Why This Matters

The agent harness is becoming the "operating system" layer of AI applications — the boring-but-critical runtime underneath your agents. Open-source options like TrueForge matter because they keep that layer **auditable, self-hostable, and free of vendor lock-in**.

This connects to the practical side of the [OpenRouter chatbot pipeline](https://rizperdana.github.io/blog/post.html?slug=openrouter-chatbot): once you've got an API call working, an agent harness is what turns that single call into a product — with sessions, tools, and a UI.

## Frequently Asked Questions

**Q: What is an agent harness?**
A: An agent harness is the runtime layer that runs the LLM execution loop: model calls, tool access, sandboxing, approvals, context management, and session state. TrueForge is one such open-source harness.

**Q: How is TrueForge different from an agent framework like LangChain?**
A: Frameworks provide orchestration APIs and abstractions. A harness provides the execution runtime — the loop, sandbox, and approvals — so you keep your own code and integrate over HTTP or the SDK.

**Q: Does TrueForge support MCP servers?**
A: Yes. TrueForge connects to remote MCP servers with header auth or OAuth, including in-chat authorization flows.

**Q: Is TrueForge free?**
A: It's MIT-licensed open source. Local mode is free and runs entirely on your machine; hosted mode requires your own Postgres and Redis.

**Q: Can I use it with any LLM provider?**
A: Yes — OpenAI, Anthropic, Google Gemini, or any OpenAI-compatible endpoint.

## Key Takeaways

- [TrueForge](https://github.com/truefoundry/trueforge) is an MIT-licensed agent harness that runs the LLM execution loop — model calls, MCP tools, skills, sandboxing, approvals, session state
- It exposes chat UI, an HTTP API with TypeScript SDK, and an embeddable UI SDK
- Local mode: one process + SQLite via `npx @truefoundry/trueforge`; hosted: Postgres + Redis via Docker Compose/Helm
- Publishes benchmarks vs Claude Managed Agents and deepagents claiming same accuracy at lower cost
- Requires Node.js ≥ 22.13; trended on GitHub August 18, 2026

---

*Source: [github.com/truefoundry/trueforge](https://github.com/truefoundry/trueforge) · Trended on [trendshift.io](https://trendshift.io/repositories/155463) on August 18, 2026*