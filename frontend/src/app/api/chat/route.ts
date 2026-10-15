import { NextResponse } from 'next/server';
// import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();
    const systemMsg = messages.find((m: any) => m.role === 'system');
    const convo = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const completion = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: convo || 'Hello',
      config: {
        systemInstruction: systemMsg?.content || 'You are a helpful AI assistant.',
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const response = completion.text || 'I apologize, but I could not generate a response.';
    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}