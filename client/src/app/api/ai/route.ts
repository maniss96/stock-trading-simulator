import { NextRequest, NextResponse } from 'next/server';

/**
 * Serverless AI proxy route (works on Vercel without a separate backend).
 *
 * The NVIDIA API key is supplied by the client from its own localStorage and
 * passed in the `x-nvidia-key` header. The key is NEVER stored on the server;
 * this route only forwards the request so the key isn't exposed in client-side
 * network calls to a third-party origin (avoids CORS + keeps usage server-side).
 */

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-nvidia-key') || process.env.NVIDIA_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'No NVIDIA API key provided. Add one in the API Keys page.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      model = 'minimaxai/minimax-m3',
      prompt,
      systemPrompt,
      maxTokens = 1024,
      temperature = 0.7,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A prompt is required' },
        { status: 400 }
      );
    }

    // Cap prompt length for safety
    const safePrompt = prompt.slice(0, 8000);

    const messages = [
      {
        role: 'system',
        content:
          systemPrompt ||
          'You are a professional financial analyst AI for an educational stock trading simulator. Provide clear, concise, data-driven insights. This is for learning purposes only and is not financial advice.',
      },
      { role: 'user', content: safePrompt },
    ];

    const nvidiaRes = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: Math.min(maxTokens, 4096),
        temperature,
        top_p: 0.95,
        stream: false,
      }),
    });

    if (!nvidiaRes.ok) {
      let message = 'AI service error';
      if (nvidiaRes.status === 401) message = 'Invalid NVIDIA API key';
      else if (nvidiaRes.status === 429) message = 'Rate limit reached. Try again shortly.';
      return NextResponse.json(
        { success: false, error: message, status: nvidiaRes.status },
        { status: nvidiaRes.status }
      );
    }

    const data = await nvidiaRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({
      success: true,
      data: {
        content,
        model,
        usage: data?.usage ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reach AI service' },
      { status: 500 }
    );
  }
}
