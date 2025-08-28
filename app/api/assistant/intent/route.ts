import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

type Intent =
  | { type: 'buy'; eventId: string | null; quantity?: number | null }
  | { type: 'marketplace'; eventId: string | null }
  | { type: 'navigate'; href: string }
  | { type: 'search'; query: string }
  | { type: 'list_ticket'; ticketId?: string | null; priceEth?: number | null }

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing query' }, { status: 400 })
    }

    // Provide the LLM context about known events to improve grounding
    const events = await DatabaseService.getAllEvents()
    const eventBrief = events.map((e) => ({ id: e.id, name: e.name, date: e.date, location: e.location })).slice(0, 50)

    const system = `You are an intent parser for a Web3 ticketing app. Return ONLY a strict JSON object.
Allowed intents:
- { "type": "buy", "eventId": string|null, "quantity"?: number }
- { "type": "marketplace", "eventId": string|null }
- { "type": "navigate", "href": string }
- { "type": "search", "query": string }
- { "type": "list_ticket", "ticketId"?: string|null, "priceEth"?: number|null }

Rules:
- Prefer mapping event names to an eventId from the provided list. If uncertain, set eventId to null.
- For phrases like "show me second hand tickets" or "resale", use type "marketplace".
- For buying tickets like "buy 2 tickets for X", use type "buy" with quantity.
- If user asks to list their ticket, use "list_ticket" and include ticketId and priceEth when specified; otherwise leave them null.
- If the query is a general search, use type "search" with a cleaned query string.
- For navigate, constrain href to one of: "/" (events), "/about", "/dashboard" (my tickets). Map synonyms like "home", "events" -> "/"; "about us" -> "/about"; any phrase containing "ticket" or "dashboard" -> "/dashboard".
- Never include commentary; output valid JSON only.`

    const user = `User query: ${query}\nKnown events: ${JSON.stringify(eventBrief)}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI error: ${text}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    let intent: Intent
    try {
      intent = JSON.parse(content)
    } catch {
      // Fallback: treat as a plain search
      intent = { type: 'search', query }
    }

    return NextResponse.json({ success: true, intent })
  } catch (error) {
    console.error('❌ Intent parse failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to interpret query' }, { status: 500 })
  }
}
