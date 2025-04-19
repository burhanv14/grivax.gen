import { getPageContext } from './getPageContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getAIResponse(
  messages: Message[],
  includePageContext: boolean = true
): Promise<string> {
  try {
    // Get the current page context if requested
    const pageContext = includePageContext ? getPageContext() : '';
    
    // Prepare the messages array with system context
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful AI assistant for Grivax, an educational platform. 
      ${pageContext ? `\n\nCurrent page context:\n${pageContext}\n\n` : ''}
      Guidelines:
      1. Provide concise, accurate, and helpful responses
      2. If you're unsure about something, say so
      3. Use a friendly and professional tone
      4. When relevant, reference the current page context in your responses
      5. If the question is about the current page, use the context to provide specific answers
      6. Make it sound like you're a human talking to a human. Do not mention "based on the current page context" or anything like that."`
    };

    // Make the API call to our chat endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [systemMessage, ...messages],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error getting AI response:', error);
    if(error instanceof Error && error.message == "Unauthorized") {
      return "Hi! You will have to log in before you can talk to me. :)";
    }
    if (error instanceof Error) {
      return `I apologize, but I encountered an error: ${error.message}. Please try again.`;
    }
    return 'I apologize, but I encountered an error while processing your request. Please try again later.';
  }
} 