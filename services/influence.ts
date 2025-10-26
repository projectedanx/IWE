
import type { InfluenceScore, WordBundle } from '../types';
import { GoogleGenAI } from "@google/genai";

const DATAMUSE_URL = "https://api.datamuse.com/words";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

async function getDatamuseFrequency(term: string): Promise<number> {
  try {
    const res = await fetch(`${DATAMUSE_URL}?sp=${encodeURIComponent(term)}&md=f&max=1`);
    if (!res.ok) return 0;
    const [record] = await res.json();
    const freqTag = record?.tags?.find((t: string) => t.startsWith('f:'));
    const freqValue = freqTag ? parseFloat(freqTag.slice(2)) : 0;
    // Normalize frequency to a 0-1 scale using a logistic function
    return clamp01(1 - Math.exp(-freqValue / 3000));
  } catch {
    return 0;
  }
}

function getIntensityHeuristic(word: string): number {
  let score = 0;
  if (/^(ultra|super|hyper|mega|over)/i.test(word)) score += 0.7;
  if (/(est|issimo)$/i.test(word)) score = Math.max(score, 0.8);
  else if (/er$/.test(word)) score = Math.max(score, 0.4);
  return clamp01(score);
}

async function getPolarityFromGemini(word: string, definitions: string[]): Promise<number> {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the sentiment polarity of the English word "${word}". Definitions: "${definitions.join('; ')}". Respond with ONLY a single number from -1.0 (very negative) to 1.0 (very positive).`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    const text = response.text.trim();
    const num = parseFloat(text);
    return isNaN(num) ? 0 : Math.max(-1, Math.min(1, num));
  } catch (e) {
    console.error("Gemini polarity fetch failed", e);
    return 0;
  }
}

export async function computeInfluence(bundle: WordBundle): Promise<InfluenceScore> {
  const rationale: string[] = [];

  const [frequency, polarity] = await Promise.all([
    getDatamuseFrequency(bundle.query),
    getPolarityFromGemini(bundle.query, bundle.definitions.map(d => d.text))
  ]);

  const intensity = getIntensityHeuristic(bundle.query);
  const persuasiveness = (bundle.wiki.toc.length / 20) + (bundle.relations.length / 100);

  if (frequency > 0.5) rationale.push(`Commonly used (freq: ${frequency.toFixed(2)})`);
  if (Math.abs(polarity) > 0.5) rationale.push(`Strongly ${polarity > 0 ? 'positive' : 'negative'} sentiment`);
  if (intensity > 0.5) rationale.push(`Intensifying form (e.g., prefix/suffix)`);
  if (persuasiveness > 0.5) rationale.push(`High encyclopedic and semantic relevance`);
  
  const score = Math.round(100 * clamp01(
    0.30 * intensity +
    0.20 * Math.abs(polarity) +
    0.35 * frequency +
    0.15 * persuasiveness
  ));

  return {
    score,
    intensity: clamp01(intensity),
    polarity,
    frequency,
    persuasiveness: clamp01(persuasiveness),
    rationale: rationale.length ? rationale : ["A word with balanced influence factors."],
  };
}
