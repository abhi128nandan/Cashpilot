import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function GET() {
  const result = streamText({
    model: groq('llama-3.1-8b-instant'),
    prompt: 'say exactly the word hello',
  });
  return result.toTextStreamResponse();
}
