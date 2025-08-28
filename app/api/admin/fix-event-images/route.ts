import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const nameToImage: Record<string, string> = {
  'Blockchain Summit 2024': '/conference2.jpeg',
  'NFT Art Exhibition': '/NFTartexhibition.jpeg',
  'Web3 Music Festival': '/cypher.png',
  'DeFi Developer Conference': '/defi.jpeg',
  'Metaverse Concert': '/metaverse.jpg',
  'Crypto Gaming Tournament': '/gaming.jpeg',
}

export async function POST(_req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin client not available. Set SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 })
    }

    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('id, name, image_url')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const updates = (events || [])
      .map((e) => ({ id: e.id as string, name: e.name as string, current: e.image_url as string | null, next: nameToImage[e.name as string] }))
      .filter((x) => !!x.next && x.current !== x.next)

    const results: Array<{ id: string; name: string; from: string | null; to: string }> = []
    for (const u of updates) {
      const { error: uerr } = await supabaseAdmin
        .from('events')
        .update({ image_url: u.next })
        .eq('id', u.id)
      if (uerr) {
        return NextResponse.json({ success: false, error: `Failed updating ${u.name}: ${uerr.message}` }, { status: 500 })
      }
      results.push({ id: u.id, name: u.name, from: u.current ?? null, to: u.next as string })
    }

    return NextResponse.json({ success: true, updated: results, totalUpdated: results.length })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

