import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { message = '', duration = 20 } = await request.json().catch(() => ({}))
  const text = String(message).slice(0, 1200)
  const lower = text.toLowerCase()
  const intention = lower.includes('sleep') ? 'rest' : lower.includes('focus') ? 'focus' : lower.includes('ground') ? 'grounding' : 'ease'

  const reply = `For a ${duration}-minute practice, begin with three slow breaths and set an intention of ${intention}. Move gently through crown, heart, abdomen, and lower-body hand positions. Stay longer wherever you feel most settled. Close by noticing what changed without judging it.`
  return NextResponse.json({ reply, mode: process.env.OPENAI_API_KEY ? 'provider-ready' : 'safe-fallback' })
}