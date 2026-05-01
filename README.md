# The Users Request – Lexicon Research Companion

"The Users Request with beyond expected expectations" is a multi-source, AI-augmented lexicon companion that fuses authoritative language datasets with guided generative insights. The application prioritizes attribution, resilience, and a frictionless research workflow for writers, researchers, and generalists alike.

## Current Status
- ✅ Core Vite + React + TypeScript scaffold is in place.
- ✅ Environment configuration is validated at runtime via [`lib/env.ts`](./lib/env.ts) with sensible defaults and actionable error messages.
- ✅ Adapters surface attribution, telemetry, and graceful degradation paths backed by automated resilience and accessibility tests.
- ⚠️ Additional product polish (e.g., deeper analytics visualizations) remains in the idea backlog (see [`SUGGESTIONS.md`](./SUGGESTIONS.md)).
- ✅ Continuous integration now enforces type-safety, unit coverage, and accessibility checks.

## Key Architectural Concepts
- **Adapter Pattern:** Each external API integration belongs in `src/adapters`, normalizing output into shared types defined in `src/types`.
- **Orchestrator Service:** `src/services/orchestrator.ts` coordinates adapter calls via `Promise.allSettled`, aggregating data into a unified `WordBundle`.
- **Client Storage:** IndexedDB will persist long-lived history, while session storage will cache transient results.
- **AI Integration:** Gemini via `@google/genai` is the default, and an OpenAI pathway is available when `VITE_AI_PROVIDER=openai`, all following the guardrails documented in [`AGENTS.md`](./AGENTS.md).

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   - Duplicate `.env.example` (or create `.env.local`) and set the values described below. Gemini remains the default provider (`VITE_AI_PROVIDER=gemini`), but you can opt into OpenAI by setting `VITE_AI_PROVIDER=openai` alongside `VITE_OPENAI_API_KEY`.
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

## Environment Configuration
Environment variables are validated at startup using [`zod`](https://github.com/colinhacks/zod). Supported keys include:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_AI_PROVIDER` | Optional (defaults to `gemini`) | Selects the AI backend: `gemini` or `openai`. |
| `VITE_GEMINI_API_KEY` | Optional (required for Gemini-powered tools) | API key used by AI features such as the influence meter, analyst, and conceptual blender when Gemini is active. |
| `VITE_OPENAI_API_KEY` | Optional (required for OpenAI-powered tools) | API key used when `VITE_AI_PROVIDER=openai`. |
| `VITE_OPENAI_MODEL` | Optional | Override the OpenAI Responses API model (defaults to `gpt-4.1-mini`). |
| `VITE_DICTIONARY_API_URL` | Optional | Override for the DictionaryAPI endpoint. |
| `VITE_DATAMUSE_API_URL` | Optional | Override for Datamuse endpoints. |
| `VITE_CONCEPTNET_API_URL` | Optional | Override for ConceptNet queries. |
| `VITE_WIKIPEDIA_API_URL` | Optional | Override for the Wikipedia parsing API. |
| `VITE_CACHE_TTL_MINUTES` | Optional | Session cache lifetime (defaults to 30 minutes). |

If any configured values fail validation, the app halts with a descriptive console error so issues can be resolved before runtime failures occur.

## Persona-Aware Prompt Playbook
All AI prompts align with three personas regardless of provider. When extending AI interactions, keep the following guardrails in mind:

- **Generalist** – Focus on concise, multi-source summaries. Require inline citations (`[dictionaryapi]`, `[conceptnet]`) for every factual claim and avoid speculation. Reinforce safety instructions to stay within provided evidence.
- **Writer** – Emphasize tone, rhetorical devices, and stylistic inspiration while banning hallucinated facts. Encourage referencing sourced data for credibility, and remind the model to propose multiple creative angles with clear provenance.
- **Researcher** – Drive analytical depth using structured outputs (`responseSchema`) and explicit constraints that forbid unsupported claims. Ask for open questions, conflicting evidence, and next-step hypotheses citing relevant adapters.

Whenever a new prompt is introduced, document the persona alignment, safety checks, and expected output structure to maintain semantic fidelity.

## Next Steps
1. Explore additional visualizations that highlight adapter telemetry trends over time.
2. Expand IndexedDB history browsing with filtering and exporting workflows.
3. Continue evolving persona-specific AI tooling with reusable prompt templates.

## Dialectical Tension Map
The application now includes an Epistemic Matrix to surface unresolvable dialectical tensions inherent in vocabulary. See `DIALECTIC.md` for the Hickam_Orientation and the philosophical stance preserving structural isomorphism against parsimonious flattening.
