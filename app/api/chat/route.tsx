// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Simulate an AI delay (optional, e.g., 500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return the exact same message as the AI response
    return NextResponse.json({ reply: message });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}