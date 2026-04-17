import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_VOICES = new Set([
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'nova',
  'onyx',
  'sage',
  'shimmer',
  'verse',
  'marin',
  'cedar',
])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const text = typeof body?.text === 'string' ? body.text.trim() : ''
    const requestedVoice =
      typeof body?.voice === 'string' && ALLOWED_VOICES.has(body.voice)
        ? body.voice
        : 'coral'

    if (!text) {
      return new Response('Missing text', { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response('OPENAI_API_KEY is not set', { status: 500 })
    }

    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: requestedVoice,
        input: text,
        response_format: 'mp3',
      }),
      cache: 'no-store',
    })

    if (!upstream.ok) {
      const err = await upstream.text().catch(() => 'TTS request failed')
      return new Response(err || 'TTS request failed', { status: upstream.status })
    }

    const audioBuffer = await upstream.arrayBuffer()

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    return new Response(error?.message || 'Unexpected TTS error', { status: 500 })
  }
}