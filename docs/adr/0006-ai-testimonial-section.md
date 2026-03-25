# ADR 0006: AI Testimonial Section — Static Pre-Computed Evaluations

- Status: Proposed
- Date: 2026-03-05
- Decision Owners: Portfolio Maintainer

## Context

Portfolio sites traditionally feature human testimonials or self-written project
descriptions. Both have credibility problems: human testimonials are curated,
self-descriptions are inherently biased.

AI models can evaluate codebases with reasonable objectivity — assessing
architecture, code quality, test coverage, and patterns. This creates an
opportunity for a novel portfolio section: AI-generated project evaluations that
the visitor can verify independently.

## Decision

Add an "AI Testimonials" section to the portfolio frontend. Evaluations are
**pre-computed at build time** and served as static content. No live LLM calls
from visitor sessions.

### Approach

1. **Evaluation categories** — Fixed set of evaluation angles:
   - Architecture & design patterns
   - Code quality & consistency
   - Test coverage & strategy
   - Production readiness

2. **Generation pipeline** — A build-time script that:
   - Feeds project source code + a fixed evaluation prompt to an LLM
   - Captures the full response unedited (criticism included)
   - Outputs structured JSON (category, rating, prose, criticisms)
   - Commits the result alongside the portfolio source

3. **Display** — Each project card shows:
   - The exact prompt used (transparency / reproducibility)
   - The unedited AI response
   - Commit hash + date of the evaluated code ("Last evaluated: March 2026, abc123")
   - A note inviting skeptics to run the same prompt themselves

4. **No live user input touches a prompt.** The injection attack surface is zero.

### Why static over live

| Concern           | Live evaluation              | Static (chosen)              |
|-------------------|------------------------------|------------------------------|
| Injection risk    | User input in prompts — high | None — zero attack surface   |
| Cost              | Per-visitor API calls        | One-time at build            |
| Credibility       | Could hide system prompt bias| Prompt is public, response unedited |
| Rate limiting     | Needed                       | Not needed                   |
| Latency           | Seconds per evaluation       | Instant (static content)     |

### Tone

The section should lean into honesty, not curation. If the AI flags weak test
coverage or a heavy views layer, that stays in. Selectively publishing only
positive evaluations would undermine the entire premise. The credibility comes
from publishing warts and all.

## Consequences

- Evaluations must be re-run manually when the codebase changes significantly
- The prompt design matters — vague prompts produce vague praise; specific
  evaluation criteria produce useful (and sometimes critical) feedback
- Versioning evaluations by commit hash lets visitors see how the codebase
  evolves over time

## Future consideration

If an interactive element is desired later, the safest approach is letting
visitors ask follow-up questions against the **cached evaluation text** (not the
source code). This keeps the context small and prevents injection into
code-evaluation prompts.
