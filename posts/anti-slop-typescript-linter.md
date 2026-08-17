---
title: "Anti-Slop: TypeScript Linter Rules for Rejecting Low-Quality Code"
date: 2026-08-17
tags: [typescript, oxlint, linting, code-quality, static-analysis, ai-generated-code, software-engineering]
description: "Anti-slop is a set of opinionated Oxlint rules for TypeScript and JavaScript that reject low-evidence, low-signal code patterns — including AI-generated slop."
---

# Anti-Slop: TypeScript Linter Rules for Rejecting Low-Quality Code

> **TL;DR**: Anti-slop is an open-source Oxlint plugin with 15 opinionated rules that reject low-evidence TypeScript and JavaScript patterns — including the sloppy type assertions, `unknown` sprawl, and module mocking that AI code generators commonly produce. It's trending today as developers fight back against AI-generated code rot.

Every codebase accumulates entropy. In 2026, AI code generators accelerated the process: they churn out TypeScript that *looks* reasonable but smuggles in type assertions, `unknown` return types, and mock-heavy test patterns that silently degrade reliability. [Anti-slop](https://github.com/dmmulroy/anti-slop) by [dmmulroy](https://github.com/dmmulroy) is a set of opinionated [Oxlint](https://oxc.rs) rules that catch exactly these patterns before they land on `main`.

## What Is Anti-Slop?

Anti-slop is a vendored Oxlint plugin (not an npm dependency) containing 15 lint rules that reject TypeScript and JavaScript patterns considered low-evidence or low-signal. It's designed to be copied into your repository, read, and modified to match your team's standards — not treated as a fixed dependency.

The project [trended on GitHub](https://trendshift.io/repositories/141355) with [49 new stars](https://github.com/dmmulroy/anti-slop) on August 17, 2026, driven by developer interest in AI-generated code quality tools.

| Feature | Detail |
|---------|--------|
| Rules | 15 opinionated lint rules |
| Linter | Oxlint (Rust-based, fast) |
| Language | TypeScript and JavaScript |
| Install | `npx skills add dmmulroy/anti-slop --skill install-anti-slop` |
| License | MIT |
| Approach | Vendored — copy into repo, own your config |

## Why This Matters for AI-Generated Code

Large language models produce TypeScript that type-checks but carries evidence-erasing patterns. Anti-slop targets these patterns with surgical rules:

- **`no-chained-type-assertions`** — rejects `input as object as User`, the "double down" pattern that fabricates type evidence
- **`no-unknown-returns`** — rejects functions returning `unknown` or `Promise<unknown>`, which forces downstream code into defensive casting
- **`no-module-mocking`** — rejects `vi.mock()` and `jest.mock()`, nudging toward real dependency seams instead of wholesale fakes
- **`no-widen-then-assert`** — catches the loop of widening a type to `unknown` then asserting it back

These are exactly the patterns an LLM will produce when asked to "make it type-safe" without understanding the codebase's boundary contracts.

## The Rules in Detail

Anti-slop enforces 15 rules. Here are the most impactful:

### Type Safety Rules

```typescript
// ❌ no-chained-type-assertions
const user = input as object as User;

// ❌ no-known-value-widening
const handlers: Record<string, Handler> = {
  start: startHandler, // discards the known 'start' key
};

// ❌ no-widen-then-assert
const loaded: User = loadUser();
const stored: unknown = loaded;
const user = stored as User;
```

**Fix:** Use `satisfies` instead of annotation to preserve inference, or use schema validation libraries like [Zod](https://zod.dev) for runtime safety.

### Structural Rules

```typescript
// ❌ no-unknown-parameters
function handle(input: unknown) {}

// ❌ no-unknown-returns
function loadUser(): unknown { return input; }

// ❌ no-object-parameters
function save(value: object) {}

// ❌ no-shape-in-symbol-names
interface UserShape { id: string; }
```

**Fix:** Type your parameters explicitly. If you truly need polymorphism, use generics or branded types.

### Runtime Rules

```typescript
// ❌ no-reflect-apply
const value = Reflect.apply(operation, owner, args);

// ❌ no-reflect-get
const value = Reflect.get(owner, key);

// ❌ no-runtime-typeof
if (typeof input === "string") { useName(input); }
```

**Fix:** Use typed function calls and property access. For `typeof`, opt into `allowInTypeGuards: true` if your project relies on type predicates.

### Safety Rules

```typescript
// ❌ no-chained-type-assertions (without safety comment)
const userId = value as UserId;

// ✅ with safety comment
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

**Fix:** Every `as` assertion must document why it's safe — a comment that makes the reviewer's job easier and the author's intent explicit.

## Getting Started

### Quick Install (Recommended)

Use the agent skill installer — it handles copying, dependency installation, and config merging automatically:

```bash
npx skills add dmmulroy/anti-slop --skill install-anti-slop
```

Then ask your coding agent to install or configure anti-slop in the current repository.

### Manual Install

1. Copy `src/` into your repo (e.g., `tools/oxlint/anti-slop/`)

2. Install Oxlint and the plugin:

```bash
npm install -D oxlint @oxlint/plugins
```

3. Register in `oxlint.config.ts`:

```typescript
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
  ],
  rules: {
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-unknown-returns": "error",
    // ... add all 15 rules
  },
});
```

4. Run and iterate:

```bash
oxlint .
```

The first run will surface violations. Fix the critical ones, then adopt the rest incrementally.

## Anti-Slop vs ESLint

| Aspect | ESLint + TypeScript-ESLint | Oxlint + Anti-Slop |
|--------|--------------------------|-------------------|
| Speed | ~30s on large repos | ~2s on large repos |
| Written in | JavaScript/TypeScript | Rust |
| Config format | flat config / legacy | flat config (Oxlint-native) |
| Custom rules | Plugin API (JS) | Vendored (JS, but bundled) |
| Anti-slop rules | Not available | 15 opinionated rules |
| Plugin ecosystem | Vast | Growing, but leaner |

Oxlint's speed advantage compounds with CI. If you run anti-slop on every commit, a 2-second lint pass is the difference between "lint on every push" and "lint only before release."

## Why This Matters

The rise of AI code generation created a new category of technical debt: code that type-checks, passes basic tests, but carries patterns that degrade maintainability over time. Anti-slop is one of the first tools specifically targeting this pattern class.

For teams using Claude Code, Cursor, or Codex as daily assistants, anti-slop functions as a post-generation filter — it catches the low-evidence assertions and `unknown` sprawl that models produce when they prioritize "it works" over "it's correct."

This aligns with the approach discussed in [Building Reliable LLM Pipelines with Structured Output](../blog/post.html?slug=building-reliable-llm-pipelines-with-structured-output), where schema validation acts as a reliability layer for LLM outputs. Anti-slop applies the same principle to the code the LLM produces.

For a broader view on code quality fundamentals, see [Fundamentals of Good Programming Practices](../blog/post.html?slug=good-programming-practices).

## Frequently Asked Questions

**Q: Does anti-slop replace ESLint?**
A: No. Anti-slop is an Oxlint plugin, not an ESLint config. It targets a specific class of patterns — low-evidence type assertions, `unknown` sprawl, and mock-heavy tests. Use it alongside your existing ESLint setup or migrate to Oxlint entirely for the speed benefit.

**Q: Can I use anti-slop with ESLint instead of Oxlint?**
A: Not directly. Anti-slop is built on Oxlint's plugin API and its rule set. If you're on ESLint, consider migrating to Oxlint — the performance improvement is significant, especially in CI.

**Q: Is anti-slop opinionated?**
A: Yes — that's the point. The rules are designed to be vendored and modified. Copy them into your repo, read them, and adjust the strictness to match your team's standards.

**Q: Does anti-slop help with AI-generated code?**
A: That's its primary use case. Anti-slop targets the exact patterns LLMs produce: chained assertions, `unknown` types, module mocking, and reflect-based workarounds. It's a post-generation quality filter for teams using AI assistants.

## Key Takeaways

- [Anti-slop](https://github.com/dmmulroy/anti-slop) is an Oxlint plugin with 15 rules that reject low-evidence TypeScript patterns, including AI-generated slop
- The rules target chained type assertions, `unknown` types, module mocking, and reflect-based code — all common LLM output patterns
- Install via `npx skills add dmmulroy/anti-slop --skill install-anti-slop` or copy `src/` into your repo for vendored use
- Oxlint delivers lint speeds of ~2 seconds on large repos vs ~30 seconds for ESLint
- Anti-slop is MIT-licensed and designed to be vendored and customized per team

---

*Source: [github.com/dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) · Trended on [trendshift.io](https://trendshift.io/repositories/141355) on August 17, 2026*
