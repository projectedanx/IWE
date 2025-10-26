# The Users Request – Lexicon Research Companion

"The Users Request with beyond expected expectations" is a multi-source, AI-augmented lexicon companion that fuses authoritative language datasets with guided generative insights. The application prioritizes attribution, resilience, and a frictionless research workflow for writers, researchers, and generalists alike.

## Current Status
- ✅ Core Vite + React + TypeScript scaffold is in place.
- ✅ Adapters and services directories are structured for multi-source integrations.
- ⚠️ UX, accessibility states, caching, and testing require significant enhancement (see [`SUGGESTIONS.md`](./SUGGESTIONS.md)).
- ⚠️ Deployment and CI/CD automation have not been configured.

## Key Architectural Concepts
- **Adapter Pattern:** Each external API integration belongs in `src/adapters`, normalizing output into shared types defined in `src/types`.
- **Orchestrator Service:** `src/services/orchestrator.ts` coordinates adapter calls via `Promise.allSettled`, aggregating data into a unified `WordBundle`.
- **Client Storage:** IndexedDB will persist long-lived history, while session storage will cache transient results.
- **AI Integration:** All Gemini interactions should flow through `@google/genai`, following the guardrails documented in [`AGENTS.md`](./AGENTS.md).

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   - Duplicate `.env.local.example` (or create `.env.local`) and set `GEMINI_API_KEY`.
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Open the app**
   - Navigate to the printed local URL.

## Development Guidelines
- Review [`AGENTS.md`](./AGENTS.md) for the canonical engineering identity and guardrails.
- Track actionable work in [`TODO.md`](./TODO.md) and reference rationales in [`SUGGESTIONS.md`](./SUGGESTIONS.md).
- Prioritize semantic fidelity, accessibility, and resilience with every change.

## Next Steps
1. Implement environment schema validation and graceful degradation tests.
2. Design attribution-forward UX patterns with comprehensive loading and error states.
3. Establish telemetry, storage, caching, and CI pipelines to support reliable iteration.
