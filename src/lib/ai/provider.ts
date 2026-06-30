import { createGroq } from '@ai-sdk/groq';
import { env } from '@/lib/env';
export interface AIProviderConfig {
  id: string;
  name: string;
  model: string;
}

export function getAIProvider() {
  // 1. Groq (Preferred Provider)
  if (env.GROQ_API_KEY) {
    const groq = createGroq({
      apiKey: env.GROQ_API_KEY,
    });
    
    const primaryModel = 'llama-3.3-70b-versatile';
    
    return {
      provider: groq,
      model: groq(primaryModel),
      config: { id: 'groq', name: 'Groq', model: primaryModel }
    };
  }

  return null;
}
