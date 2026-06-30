// Environment variable validation and fallback handling
export const env = {
  get groqKey() {
    return process.env.GROQ_API_KEY || '';
  },
  get ollamaBaseUrl() {
    return process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
  },
  get useOllama() {
    return process.env.USE_OLLAMA === 'true';
  },
  get hasAIProvider() {
    return Boolean(this.groqKey || this.useOllama);
  }
};
