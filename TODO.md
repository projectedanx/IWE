# TODO

This document captures upcoming work items for the project. Each entry references an associated suggestion in `SUGGESTIONS.md` for expanded rationale.

## High-Priority Tasks

1. **Set up environment configuration management** – Introduce typed environment schema validation using `zod` or similar to prevent runtime failures (see Suggestion 1).
2. **Implement orchestrator resilience testing** – Add integration tests simulating partial adapter failures to guarantee graceful degradation (Suggestion 2).
3. **Design UX for multi-source attribution** – Create UI patterns that visually differentiate AI-generated content from sourced facts (Suggestion 3).
4. **Add loading, empty, and error states** – Ensure every data surface in the UI communicates status with accessible patterns (Suggestion 4).
5. **Create adapter performance telemetry** – Instrument adapters with timing metrics surfaced in the dev console or a debug panel (Suggestion 5).

## Secondary Tasks

6. **Persist query history in IndexedDB** – Implement storage hooks and UI to browse historical lookups (Suggestion 6).
7. **Implement session caching layer** – Cache recent API responses in session storage with expiry controls (Suggestion 7).
8. **Document AI prompt engineering guidelines** – Expand project docs with persona-driven prompt templates (Suggestion 8).
9. **Adopt automated accessibility checks** – Integrate `axe-core` or similar into the testing pipeline (Suggestion 9).
10. **Establish CI pipeline** – Configure GitHub Actions for linting, type-checking, and testing on every push (Suggestion 10).
