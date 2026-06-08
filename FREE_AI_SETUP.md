# CashPilot AI Setup Guide

CashPilot's AI features are powered by the Vercel AI SDK and can run entirely on **FREE** models via OpenRouter, Google Gemini, or locally via Ollama. You no longer need a paid OpenAI API key to get personalized financial insights.

## Option 1: OpenRouter (Recommended & Easiest)
OpenRouter provides free access to top-tier open-source models like `mistralai/mistral-7b-instruct` and `meta-llama/llama-3-8b-instruct`.

1. Go to [OpenRouter.ai](https://openrouter.ai/) and sign in with your Google or GitHub account.
2. Navigate to **Keys** and click **Create Key**.
3. Copy the generated key.
4. Open the `.env.local` file in the root of your project and add:
   ```env
   OPENROUTER_API_KEY=your_copied_key_here
   ```
5. Restart your development server (`npm run dev`). CashPilot will automatically detect the key and route all AI insights through the free Mistral model.

## Option 2: Local AI via Ollama (Most Private)
If you have a modern computer (M1/M2 Mac, or a PC with a dedicated GPU), you can run models entirely locally. This means your financial data never leaves your machine.

1. Download and install [Ollama](https://ollama.com/).
2. Open your terminal and run:
   ```bash
   ollama run llama3
   ```
   *(This will download the 4.7GB Llama 3 model. It may take a few minutes).*
3. Open the `.env.local` file in your project and add:
   ```env
   USE_OLLAMA=true
   OLLAMA_BASE_URL=http://localhost:11434/v1
   ```
4. Restart your development server. CashPilot will now generate insights using your local GPU.

## Option 3: Google Gemini (Free Tier)
Google offers a generous free tier for Gemini 1.5 Flash.

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Add it to your `.env.local`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
*(Note: To fully utilize Gemini directly via the AI SDK, you may need to install `@ai-sdk/google` via `npm install @ai-sdk/google` and update `src/lib/ai/provider.ts` to use it, or simply use Gemini through OpenRouter in Option 1).*

---

### Verifying Connection
After setting up your preferred option, open CashPilot and navigate to the **Settings** page. Under the **AI Configuration** section, you should see the status marked as **Connected**. Try asking the AI Chat a question like *"How much did I spend on dining this month?"* to verify it is working.
