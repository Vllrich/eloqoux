import { Word, WordExample, Category } from '../shared/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export async function generateWord(category: Category): Promise<Word> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-word`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  });

  if (!response.ok) throw new Error('Failed to generate word');

  const data = await response.json();
  return {
    id: Date.now().toString(),
    term: data.term,
    category: data.category,
    definition: data.definition,
    synonyms: data.synonyms || [],
    antonyms: data.antonyms || [],
    etymology: data.etymology || '',
    examples: data.examples.map((ex: WordExample, idx: number) => ({
      ...ex,
      _key: `${data.term}-${idx}-${Date.now()}`,
    })),
    dateViewed: new Date().toISOString(),
  };
}

export async function generateExamples(
  word: string,
  category: Category,
  count: number = 3
): Promise<WordExample[]> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-examples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, category, count }),
  });

  if (!response.ok) throw new Error('Failed to generate examples');

  const data = await response.json();
  return data.examples;
}
