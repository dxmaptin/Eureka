import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant representing *Eureka*, the Web3 evolution of Toutix — a next-gen ticketing platform that eliminates scalping, 
            restores revenue to event creators, and transforms tickets into on-chain digital credentials. Eureka mints every ticket as an NFT, enforces programmable 
            royalties, and verifies ownership at the gate using dynamic QR and NFC codes. Fans onboard seamlessly via email or wallet, with fiat and crypto payments 
            supported. Under the hood, Eureka runs on Solana for speed and low fees, but presents a frictionless experience that feels Web2. Beyond ticketing, Eureka 
            unlocks a new monetization layer: turning fan identity and attendance into the foundation for digital IP, loyalty, and community ownership. It's not just a 
            ticket — it's infrastructure for the future of entertainment.
          Be helpful, professional, and knowledgeable about his work. If asked about something not in his background, politely redirect to his actual experience.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
} 