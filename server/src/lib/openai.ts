import OpenAI from "openai";
import { encode, decode } from "@toon-format/toon";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface WordData {
  term: string;
  category: string;
  definition: string;
  examples: Array<{
    sentence: string;
    context: string;
  }>;
}

export async function generateWord(category: string): Promise<WordData> {
  const prompt = `Generate an eloquent, sophisticated word from the "${category}" category. 
Return the response in TOON format with this structure:
word{term,category,definition,examples[3]{sentence,context}}

The word should be:
- Advanced vocabulary suitable for eloquent speech
- Specific to the ${category} domain
- Include 2 example sentences where the word is used naturally
- Each example should have context describing the situation

Return ONLY the TOON formatted data, nothing else.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a vocabulary expert. Always respond in valid TOON format as requested.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  // Parse TOON response
  try {
    const parsed = decode(content) as any;
    const wordData = parsed.word || parsed;

    return {
      term: wordData.term,
      category: wordData.category,
      definition: wordData.definition,
      examples: wordData.examples.map((ex: any) => ({
        sentence: ex.sentence,
        context: ex.context || "",
      })),
    };
  } catch (error) {
    console.error("Failed to parse TOON response:", content);
    throw new Error("Failed to parse word data from OpenAI response");
  }
}

export async function generateMoreExamples(
  word: string,
  category: string,
  count: number = 3
): Promise<Array<{ sentence: string; context: string }>> {
  const prompt = `Generate ${count} more example sentences using the word "${word}" in the context of ${category}.
Return the response in TOON format:
examples[${count}]{sentence,context}

Each example should:
- Use the word naturally in a sentence
- Include context describing the situation
- Be diverse and show different uses of the word

Return ONLY the TOON formatted data, nothing else.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a vocabulary expert. Always respond in valid TOON format as requested.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const parsed = decode(content) as any;
    const examples = parsed.examples || parsed;

    return examples.map((ex: any) => ({
      sentence: ex.sentence,
      context: ex.context || "",
    }));
  } catch (error) {
    console.error("Failed to parse TOON response:", content);
    throw new Error("Failed to parse examples from OpenAI response");
  }
}
