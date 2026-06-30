import { z } from 'zod';

const serverEnvSchema = z.object({
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL is required').optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required').optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL is required').default('http://localhost:3000'),
});

const isServer = typeof window === 'undefined';

const publicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!publicEnv.success) {
  console.error('❌ Invalid public environment variables:', publicEnv.error.format());
  throw new Error('Invalid public environment variables');
}

let serverEnv = { data: {} as z.infer<typeof serverEnvSchema> };

if (isServer) {
  const parsed = serverEnvSchema.safeParse({
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:', parsed.error.format());
    throw new Error('Invalid server environment variables');
  }
  serverEnv = { data: parsed.data };
}

export const env = {
  ...publicEnv.data,
  ...serverEnv.data,
  get hasAIProvider(): boolean {
    return Boolean((this as any).GROQ_API_KEY);
  }
};
