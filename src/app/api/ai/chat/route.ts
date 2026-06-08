import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guard';
import { fetchDashboardAnalytics } from '@/services/analytics.service';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    await requireAuth();

    // 2. Extract message from the request body
    const body = await req.json().catch(() => ({}));
    const message = body?.message || '';

    if (!message) {
      return NextResponse.json(
        { reply: 'Invalid message format' },
        { status: 400 }
      );
    }

    // 3. Fetch live data
    const analytics = await fetchDashboardAnalytics();
    
    // 4. Handle empty transaction data
    if (!analytics || !analytics.recentTransactions || analytics.recentTransactions.length === 0) {
      return NextResponse.json({
        reply: 'You do not have enough transaction data yet. Add some transactions to get AI insights.',
      });
    }

    // 5. Smart savings analysis
    const foodDiningExpenses = analytics.spendingByCategory?.find((c: any) => c.categoryName === 'Food & Dining')?.totalAmount || 0;
    const utilitiesExpenses = analytics.spendingByCategory?.find((c: any) => c.categoryName === 'Utilities')?.totalAmount || 0;
    
    const savingsTips = [];
    if (foodDiningExpenses > 0) {
      savingsTips.push(
        `You spent ₹${foodDiningExpenses} on Food & Dining. Reducing this by 20% could save ₹${Math.round(foodDiningExpenses * 0.2)} monthly.`
      );
    }
    
    if (utilitiesExpenses > 0) {
      savingsTips.push(
        `Your utilities spending is ₹${utilitiesExpenses}. Monitoring electricity usage may help reduce costs.`
      );
    }

    const topCategories = analytics.spendingByCategory
      ?.slice(0, 3)
      .map((c: any) => `${c.categoryName}: ₹${c.totalAmount}`)
      .join('\n') || 'None';

    const systemPrompt = `
You are CashPilot AI.

You are a smart financial assistant.

Always:
- analyze user finances
- give savings advice
- explain spending
- provide personalized insights

Never give generic assistant replies.

Total Income: ₹${analytics.stats?.totalIncome || 0}
Total Expenses: ₹${analytics.stats?.totalExpenses || 0}
Net Balance: ₹${analytics.stats?.netBalance || 0}

Top Expense Categories:
${topCategories}

Smart Savings Insights:
${savingsTips.join('\n')}

Recent Transactions:
${analytics.recentTransactions
  .slice(0, 10)
  .map(
    (t: any) =>
      `${t.type} - ${t.category?.name || 'Uncategorized'} - ₹${t.amount}`
  )
  .join('\n')}
`;

    // 6. Direct OpenRouter Fetch Call
    const MODELS = [
      'google/gemma-2-9b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'qwen/qwen-2.5-7b-instruct:free',
    ];

    let finalData = null;
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    for (const model of MODELS) {
      try {
        const response = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'CashPilot',
            },
            body: JSON.stringify({
              model,
              messages,
            }),
          }
        );

        const data = await response.json();

        console.log('MODEL:', model);
        console.log('OPENROUTER RAW RESPONSE:', JSON.stringify(data, null, 2));

        if (!data.error) {
          finalData = data;
          break;
        }

        console.log('MODEL FAILED:', model);

      } catch (err) {
        console.error('MODEL ERROR:', model, err);
      }
    }

    if (!finalData) {
      return NextResponse.json({
        reply:
          'AI service is temporarily overloaded. Please try again in a moment.',
      });
    }

    const reply =
      finalData?.choices?.[0]?.message?.content ??
      'Unable to generate response.';

    return NextResponse.json({
      reply,
    });
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { reply: "AI service is temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
