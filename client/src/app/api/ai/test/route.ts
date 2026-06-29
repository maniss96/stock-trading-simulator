import { NextRequest, NextResponse } from 'next/server';

/**
 * Tests whether a provided NVIDIA API key is valid by making a minimal request.
 */

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model = 'minimaxai/minimax-m3' } = await req.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    const res = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with the single word: OK' }],
        max_tokens: 10,
        temperature: 0,
        stream: false,
      }),
    });

    if (res.ok) {
      return NextResponse.json({
        success: true,
        data: { valid: true, model, message: 'Connection successful' },
      });
    }

    let error = 'Connection failed';
    if (res.status === 401) error = 'Invalid API key';
    else if (res.status === 404) error = 'Model not found — check the model name';
    else if (res.status === 429) error = 'Rate limited — key works but is throttled';

    return NextResponse.json(
      { success: false, error, status: res.status },
      { status: 200 } // return 200 so the client can read the message cleanly
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not reach NVIDIA API' },
      { status: 200 }
    );
  }
}
