import { aiService } from '@/services/ai.service';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    // Fetch the last 30 transactions for context
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, description, merchant, transaction_date, currency, category:categories(name)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching transactions for AI context:', error);
    }

    const contextData = JSON.stringify(transactions || []);

    const result = await aiService.generateChatStream(messages, contextData);

    return result.toTextStreamResponse();
  } catch (error: any) {
    if (error?.message?.includes('No AI provider configured')) {
      return NextResponse.json(
        { error: 'No AI provider configured. Please set GROQ_API_KEY.' },
        { status: 503 }
      );
    }
    console.error('AI Chat Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
