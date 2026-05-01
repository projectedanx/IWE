# TODO

This document captures upcoming work items for the project. Each entry references an associated suggestion in `SUGGESTIONS.md` for expanded rationale.

## Completed Work

- [x] **Set up environment configuration management** – Centralized validation now lives in [`lib/env.ts`](./lib/env.ts) with defaults and descriptive errors.
- [x] **Implement orchestrator resilience testing** – Vitest coverage in [`services/__tests__/orchestrator.test.ts`](./services/__tests__/orchestrator.test.ts) simulates partial adapter failures.
- [x] **Design UX for multi-source attribution** – Source badges and AI disclaimers highlight provenance across the Explorer and AI panels.
- [x] **Add loading, empty, and error states** – Accessible banners communicate progress, empty results, and failures without ambiguity.
- [x] **Create adapter performance telemetry** – `traceAdapter` instrumentation plus the in-app telemetry panel surface per-source timing.
- [x] **Persist query history in IndexedDB** – Dexie-backed history powers the `RecentSearches` quick-pick experience.
- [x] **Implement session caching layer** – Session storage caching respects configurable TTLs and SSR guards via [`lib/cache.ts`](./lib/cache.ts).
- [x] **Document AI prompt engineering guidelines** – Persona-specific guardrails captured in the [`README`](./README.md#persona-aware-prompt-playbook).
- [x] **Adopt automated accessibility checks** – `jest-axe` accessibility assertions run within the Vitest pipeline.
- [x] **Establish CI pipeline** – GitHub Actions workflow [`ci.yml`](./.github/workflows/ci.yml) enforces type safety, build integrity, and test coverage on each push.
- [x] **Implement Epistemic Matrix (Dialectical Tension Map)** – Hold contradictions in superposition without collapsing them. Added `components/DialecticTensionPanel.tsx` and `services/dialectic.ts`. Documented in `DIALECTIC.md`.
