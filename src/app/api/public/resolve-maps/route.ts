import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const trimmed = url.trim();

    // 1. If it's an iframe code, extract src
    const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      return NextResponse.json({
        success: true,
        embedUrl: iframeMatch[1],
        directUrl: iframeMatch[1],
        query: 'Kode Embed HTML Iframe',
        sourceType: 'iframe',
      });
    }

    // 2. If it's already an embed url
    if (trimmed.includes('google.com/maps/embed') || trimmed.includes('output=embed')) {
      return NextResponse.json({
        success: true,
        embedUrl: trimmed,
        directUrl: trimmed,
        query: 'Google Maps Embed URL',
        sourceType: 'embed_url',
      });
    }

    // 3. Resolve redirect (maps.app.goo.gl or full URL)
    let targetUrl = trimmed;
    let html = '';

    try {
      const res = await fetch(trimmed, { redirect: 'follow' });
      targetUrl = res.url || trimmed;
      html = await res.text();
    } catch (fetchErr) {
      console.error('Fetch redirect error:', fetchErr);
    }

    // 4. Extract place name or coordinates
    let extractedQuery = '';

    // Check for place name in /maps/place/Place+Name/
    const placeMatch = targetUrl.match(/\/maps\/place\/([^/@?]+)/) || html.match(/\/maps\/place\/([^/@?]+)/);
    // Check for @lat,lng
    const coordMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || html.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    // Check for ?q=
    const qMatch = targetUrl.match(/[?&]q=([^&"'>]+)/) || html.match(/[?&]q=([^&"'>]+)/);

    if (placeMatch && placeMatch[1]) {
      extractedQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    } else if (coordMatch) {
      extractedQuery = `${coordMatch[1]},${coordMatch[2]}`;
    } else if (qMatch && qMatch[1]) {
      extractedQuery = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
    } else {
      extractedQuery = trimmed;
    }

    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(extractedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

    return NextResponse.json({
      success: true,
      embedUrl,
      directUrl: targetUrl,
      query: extractedQuery,
      sourceType: 'resolved_url',
    });
  } catch (error: any) {
    console.error('Error resolving Google Maps URL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
