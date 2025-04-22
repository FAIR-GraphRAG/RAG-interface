import { NextResponse } from 'next/server';

export async function POST(request) {
  const { messages } = await request.json();

  const url = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({ messages, max_tokens: 500, temperature: 0.7 }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(errorText, { status: res.status });
    }

    const data = await res.json();
    const next_response =  NextResponse.json({ reply: data.choices[0].message });
    return next_response;
  } catch (err) {
    return new NextResponse(err.message, { status: 500 });
  }
}