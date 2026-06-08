import { createOpenAI } from '@ai-sdk/openai';
import { env } from '@/lib/env';

export interface AIProviderConfig {
  id: string;
  name: string;
  model: string;
}

/**
 * Creates a configured OpenAI-compatible client based on environment variables.
 * Priority: OpenRouter -> Ollama (Local)
 */
export function getAIProvider() {
  // 1. OpenRouter (Preferred Free Provider)
  if (env.openRouterKey) {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: env.openRouterKey,
    });
    
    const primaryModel = 'meta-llama/llama-3-8b-instruct';
    
    return {
      provider: openrouter,
      model: openrouter(primaryModel), // Mistral fallback is handled via routing settings if needed in OpenRouter
      config: { id: 'openrouter', name: 'OpenRouter', model: primaryModel }
    };
  }

  // 2. Google Gemini
  if (process.env.GEMINI_API_KEY) {
    // Note: If using strict @ai-sdk/google, it would look different,
    // but the user's project only has @ai-sdk/openai.
    // Google supports OpenAI compatibility on their REST endpoints in some wrappers,
    // but without the google sdk, we will fallback safely.
    // For now, if someone sets GEMINI_API_KEY but doesn't have @ai-sdk/google, we throw a helpful error.
    throw new Error('To use Gemini, please install @ai-sdk/google or use OpenRouter which aggregates it.');
  }

  // 3. Ollama (Local open source)
  if (env.useOllama) {
    const ollama = createOpenAI({
      baseURL: env.ollamaBaseUrl,
      apiKey: 'ollama', // API key is ignored by Ollama but required by the sdk client
    });
    return {
      provider: ollama,
      model: ollama('llama3'),
      config: { id: 'ollama', name: 'Ollama (Local)', model: 'llama3' }
    };
  }

  return null;
}
