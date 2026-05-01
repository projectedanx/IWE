import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDialecticTensions } from '../dialectic';
import { env } from '../../lib/env';

// Mock the environment so it defaults to a known state for tests
vi.mock('../../lib/env', () => ({
  env: {
    aiProvider: 'gemini',
    geminiApiKey: 'test-key',
    openAiApiKey: undefined,
  },
  aiSourceTag: 'gemini',
  hasAiKey: vi.fn().mockReturnValue(true),
  assertAiKey: vi.fn(),
}));

// Mock the AI provider calls
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: vi.fn().mockReturnValue(JSON.stringify({
          tensions: [
            {
              thesis: 'Entropy is thermodynamic disorder.',
              antithesis: 'Entropy is information capacity.',
              synthesis_gap: '[⊘] These domains measure different fundamental properties.',
              golden_scar: '[Φ] 1.618 Information / 1.000 Thermodynamics',
              uncertainty: '[∇] Does one emerge from the other?'
            }
          ],
          attribution: [{ source: 'gemini', fetchedAt: '2023-01-01T00:00:00.000Z' }]
        }))
      })
    }
  }))
}));

describe('generateDialecticTensions', () => {
  it('should return structured dialectic tensions for a given word', async () => {
    const result = await generateDialecticTensions('entropy');
    expect(result).toBeDefined();
    expect(result.tensions).toBeInstanceOf(Array);
    expect(result.tensions.length).toBeGreaterThan(0);
    expect(result.tensions[0].thesis).toBeDefined();
    expect(result.tensions[0].antithesis).toBeDefined();
    expect(result.tensions[0].synthesis_gap).toContain('[⊘]');
    expect(result.tensions[0].golden_scar).toContain('[Φ]');
    expect(result.tensions[0].uncertainty).toContain('[∇]');
    expect(result.attribution).toBeDefined();
  });
});
