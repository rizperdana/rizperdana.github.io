---
title: "Anti-Slop: TypeScript Linter Rules for Rejecting Low-Quality Code"
date: 2026-08-17
tags: [typescript, oxlint, linting, code-quality, static-analysis, ai-generated-code, software-engineering]
description: "Anti-slop is a set of opinionated Oxlint rules for TypeScript and JavaScript that reject low-evidence, low-signal code patterns — including AI-generated slop."
---

# Anti-Slop: TypeScript Linter Rules for Rejecting Low-Quality Code

> **TL;DR**: Anti-slop is an open-source Oxlint plugin with 15 opinionated rules that reject low-evidence TypeScript and JavaScript patterns — including the sloppy type assertions, `unknown` sprawl, and module mocking that AI code generators commonly produce. It's trending today as developers fight back against AI-generated code rot.

![Anti-Slop: Opinionated Oxlint rules for TypeScript and JavaScript](https://opengraph.githubassets.com/e5a5a27310df3babeb8f701b4ab881ffeba520dfc649b71740b28fe711d2da01/dmmulroy/anti-slop)

*The anti-slop repo — trending on GitHub August 17, 2026*

## Picture This

You're reviewing a pull request. The code *works* — tests pass, CI is green. But something feels off.

`const user = input as object as User;`

`function handle(input: unknown) {}`

`vi.mock("./user-store");`

Your reviewer instinct screams: *this is slop*. TypeScript that type-checks but says nothing. Code that erases evidence instead of preserving it. Welcome to the AI-generated code era — and [anti-slop](https://github.com/dmmulroy/anti-slop) is the linter built to fight it.

## What Is Anti-Slop?

Anti-slop is a set of 15 opinionated [Oxlint](https://oxc.rs) rules that reject low-evidence TypeScript and JavaScript patterns. Created by [dmmulroy](https://github.com/dmmulroy), it's designed to be **vendored, not installed** — copy the rules into your repo, read them, tweak them, own them.

It [trended on GitHub](https://trendshift.io/repositories/141355) with [49 new stars](https://github.com/dmmulroy/anti-slop) on August 17, 2026. The demand says it all: developers are done letting AI-generated code rot their codebases.

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-primary text-2xl">15</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Opinionated rules</div>
  </div>
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-secondary text-2xl">⚡</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Rust-based Oxlint</div>
  </div>
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-success text-2xl">MIT</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Open source</div>
  </div>
  <div class="stat bg-flexoki-bg-2 rounded-xl p-4 border border-white/5">
    <div class="stat-value text-flexoki-accent text-2xl">2s</div>
    <div class="stat-desc text-flexoki-subtle text-sm">Lint time, large repo</div>
  </div>
</div>

## Why This Matters for AI-Generated Code

Large language models produce TypeScript that *looks* right but carries evidence-erasing patterns. Anti-slop targets the most common tells with surgical precision:

- **`no-chained-type-assertions`** — rejects `input as object as User`, the "double down" that fabricates type evidence
- **`no-unknown-returns`** — rejects functions returning `unknown`, forcing downstream code into defensive casting
- **`no-module-mocking`** — rejects `vi.mock()` and `jest.mock()`, pushing you toward real dependency seams
- **`no-widen-then-assert`** — catches the widen-to-`unknown`-then-assert-back loop

<div class="alert alert-warning my-6 flex items-start gap-3 rounded-xl border border-flexoki-warning/30 bg-flexoki-warning/10 p-4">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 text-flexoki-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
  </svg>
  <div>
    <h3 class="font-bold text-flexoki-text">The "AI Slop" Problem</h3>
    <div class="text-sm text-flexoki-muted mt-1">LLMs generate TypeScript that <strong>type-checks but silently degrades</strong>. Chained assertions, <code>unknown</code> returns, and module mocking are the three most common tells. Anti-slop flags all three.</div>
  </div>
</div>

These are exactly the patterns an LLM produces when asked to "make it type-safe" without understanding the codebase's boundary contracts.

## The Rules in Detail

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

**Fix:** Use `satisfies` to preserve inference, or schema validation with [Zod](https://zod.dev) for runtime safety.

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

**Fix:** Type your parameters explicitly. Need polymorphism? Use generics or branded types.

### Runtime Rules

```typescript
// ❌ no-reflect-apply
const value = Reflect.apply(operation, owner, args);

// ❌ no-reflect-get
const value = Reflect.get(owner, key);

// ❌ no-runtime-typeof
if (typeof input === "string") { useName(input); }
```

**Fix:** Call functions and access properties directly. For `typeof`, opt into `allowInTypeGuards: true` if your project relies on type predicates.

### Safety Rules

```typescript
// ❌ type assertion without justification
const userId = value as UserId;

// ✅ with a safety comment
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

**Fix:** Every `as` assertion documents *why* it's safe. This one rule alone transforms code review — no more silent assertion archaeology.

## Getting Started

### Quick Install (Recommended)

The agent skill installer handles copying, dependency installation, and config merging automatically:

```bash
npx skills add dmmulroy/anti-slop --skill install-anti-slop
```

Then ask your coding agent to install or configure anti-slop in the current repository.

### Manual Install

1. Copy `src/` into your repo (e.g. `tools/oxlint/anti-slop/`)
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

That speed compounds in CI. A 2-second lint pass is the difference between "lint on every push" and "lint only before release."

## Why This Matters

AI code generation created a new category of technical debt: code that passes CI but degrades maintainability with every merged PR. Anti-slop is one of the first tools specifically targeting this pattern class.

For teams using Claude Code, Cursor, or Codex as daily assistants, anti-slop acts as a **post-generation quality filter** — catching the low-evidence assertions and `unknown` sprawl models produce when they prioritize "it works" over "it's correct."

This mirrors the approach in [Building Reliable LLM Pipelines with Structured Output](../blog/post.html?slug=building-reliable-llm-pipelines-with-structured-output), where schema validation acts as a reliability layer for LLM outputs. Anti-slop applies the same principle to the code the LLM produces. For a broader view, see [Fundamentals of Good Programming Practices](../blog/post.html?slug=good-programming-practices).

## Frequently Asked Questions

**Q: Does anti-slop replace ESLint?**
A: No. Anti-slop is an Oxlint plugin, not an ESLint config. It targets a specific class of patterns — low-evidence type assertions, `unknown` sprawl, and mock-heavy tests. Use it alongside your existing setup or migrate to Oxlint entirely for the speed benefit.

**Q: Can I use anti-slop with ESLint instead of Oxlint?**
A: Not directly. Anti-slop is built on Oxlint's plugin API. If you're on ESLint, migrating to Oxlint is worth it — the performance improvement is significant, especially in CI.

**Q: Is anti-slop opinionated?**
A: Yes — that's the point. The rules are designed to be vendored and modified. Copy them into your repo, read them, and adjust strictness to match your team's standards.

**Q: Does anti-slop help with AI-generated code?**
A: That's its primary use case. It targets the exact patterns LLMs produce: chained assertions, `unknown` types, module mocking, and reflect-based workarounds.

## Key Takeaways

- [Anti-slop](https://github.com/dmmulroy/anti-slop) is an Oxlint plugin with 15 rules that reject low-evidence TypeScript patterns — including AI-generated slop
- The rules target chained type assertions, `unknown` types, module mocking, and reflect-based code — all common LLM output patterns
- Install via `npx skills add dmmulroy/anti-slop --skill install-anti-slop` or vendor `src/` into your repo
- Oxlint delivers ~2s lint times on large repos vs ~30s for ESLint
- MIT-licensed and designed to be customized per team

---

*Source: [github.com/dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) · Trended on [trendshift.io](https://trendshift.io/repositories/141355) on August 17, 2026*
