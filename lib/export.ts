
import type { WordBundle } from '../types';

export function toJSON(bundle: WordBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function toMarkdown(bundle: WordBundle): string {
  const fm = {
    word: bundle.query,
    exportedAt: new Date().toISOString(),
    sources: Array.from(new Set([
      ...bundle.definitions.map(d => d.attribution.source),
      ...bundle.relations.map(r => r.attribution.source),
      ...bundle.associations.map(a => a.attribution.source),
      ...bundle.wiki.toc.map(t => t.attribution.source),
    ])).sort(),
  };

  let md = `---\n${JSON.stringify(fm, null, 2)}\n---\n\n`;
  md += `# ${bundle.query}\n\n`;

  if (bundle.phonetics && bundle.phonetics.length > 0) {
    md += `**Phonetics:** ${bundle.phonetics.map(p => p.text).filter(Boolean).join(', ')}\n\n`;
  }

  if (bundle.etymology) {
    md += `## Etymology\n\n${bundle.etymology}\n\n`;
  }

  if (bundle.definitions.length > 0) {
    md += `## Definitions\n\n`;
    bundle.definitions.forEach(d => {
      md += `- **(${d.partOfSpeech || 'definition'})** ${d.text}\n`;
      if (d.examples && d.examples.length > 0) {
        d.examples.forEach(ex => {
          md += `  - *Example:* ${ex}\n`;
        });
      }
    });
    md += '\n';
  }
  
  if (bundle.relations.length > 0) {
    md += `## Relations\n\n`;
    const groupedRelations = bundle.relations.reduce((acc, r) => {
        acc[r.rel] = acc[r.rel] || [];
        acc[r.rel].push(r.target);
        return acc;
    }, {} as Record<string, string[]>);

    for (const rel in groupedRelations) {
        md += `### ${rel}\n- ${groupedRelations[rel].join('\n- ')}\n\n`;
    }
  }

  if (bundle.wiki.toc.length > 0) {
    md += `## Wikipedia Subtopics\n\n`;
    bundle.wiki.toc.forEach(item => {
      md += `${'  '.repeat(item.level-1)}- ${item.title}\n`;
    });
    md += '\n';
  }

  return md;
}
