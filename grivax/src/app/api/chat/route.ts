import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages } = await req.json();

    // Call Claude API
    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      temperature: 0.7,
    });

    // Extract the response
    const response = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : 'I apologize, but I could not generate a text response.';

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 