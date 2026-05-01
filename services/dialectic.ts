import { GoogleGenAI } from '@google/genai';
import { env, assertAiKey, aiSourceTag } from '../lib/env';
import type { SourceAttribution } from '../types';

export interface DialecticTension {
  thesis: string;
  antithesis: string;
  synthesis_gap: string; // Must contain [⊘]
  golden_scar: string;   // Must contain [Φ]
  uncertainty: string;   // Must contain [∇]
}

export interface DialecticResult {
  tensions: DialecticTension[];
  attribution: SourceAttribution[];
}

export async function generateDialecticTensions(word: string): Promise<DialecticResult> {
  assertAiKey('Dialectic Tensions');

  const systemInstruction = `
You are the Tactile Dialectician. Your task is to surface the Epistemic Tensions inherent in the word provided.
Do not resolve these tensions. Hold them in structurally isomorphic superposition.
For the word, provide 1 to 3 core tensions. Each tension must have:
- thesis: The dominant or conventional framing.
- antithesis: The contradictory, marginalized, or alternative domain framing.
- synthesis_gap: An explicit marker of their contradiction, starting with "[⊘]".
- golden_scar: A weighting of the frames (e.g., "[Φ] 1.618 Dominant / 1.000 Subordinate").
- uncertainty: The remaining underdetermined aspect, starting with "[∇]".

Respond ONLY with a JSON object matching this schema:
{
  "tensions": [
    {
      "thesis": "string",
      "antithesis": "string",
      "synthesis_gap": "string",
      "golden_scar": "string",
      "uncertainty": "string"
    }
  ]
}
  `;

  let parsed: any;

  if (env.aiProvider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: word,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    try {
      parsed = JSON.parse(response.text() || '{}');
    } catch (e) {
      throw new Error('Failed to parse AI response as JSON.');
    }
  } else {
    // OpenAI path
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: env.openAiApiKey, dangerouslyAllowBrowser: true });

    const response = await openai.chat.completions.create({
      model: env.openAiModel,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: word }
      ],
      response_format: { type: 'json_object' }
    });

    try {
      parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON.');
    }
  }

  if (!parsed.tensions || !Array.isArray(parsed.tensions)) {
    throw new Error('Invalid response structure: missing tensions array.');
  }

  return {
    tensions: parsed.tensions,
    attribution: [{ source: aiSourceTag, fetchedAt: new Date().toISOString() }]
  };
}
