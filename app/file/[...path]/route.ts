import { NextRequest, NextResponse } from 'next/server';
import { track } from '@vercel/analytics/server';

export const runtime = 'nodejs';

const B2_DOWNLOAD_URL = process.env.B2_DOWNLOAD_URL || 'https://f005.backblazeb2.com';
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APP_KEY = process.env.B2_APP_KEY;

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

// Cached B2 auth token
let cachedAuth: { token: string; downloadUrl: string; expiry: number } | null = null;

async function getB2Auth(): Promise<{ token: string; downloadUrl: string } | null> {
  if (!B2_KEY_ID || !B2_APP_KEY) return null;
  
  if (cachedAuth && Date.now() < cachedAuth.expiry) {
    return { token: cachedAuth.token, downloadUrl: cachedAuth.downloadUrl };
  }

  const authString = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString('base64');
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: { Authorization: `Basic ${authString}` },
  });

  if (!response.ok) {
    console.error('B2 auth failed:', await response.text());
    return null;
  }

  const data = await response.json();
  cachedAuth = {
    token: data.authorizationToken,
    downloadUrl: data.downloadUrl,
    expiry: Date.now() + 23 * 60 * 60 * 1000, // 23 hours
  };

  return { token: cachedAuth.token, downloadUrl: cachedAuth.downloadUrl };
}

async function buildB2Url(path: string[], request: NextRequest): Promise<string | null> {
  if (path.length < 1) return null;

  const bucket = encodeURIComponent(path[0]);
  const filePath = path
    .slice(1)
    // Next route params arrive decoded; re-encode each segment safely.
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const userToken = new URL(request.url).searchParams.get('Authorization');

  let downloadUrl = B2_DOWNLOAD_URL;
  let authToken: string | null = userToken;

  if (!authToken && B2_KEY_ID && B2_APP_KEY) {
    const b2Auth = await getB2Auth();
    if (b2Auth) {
      authToken = b2Auth.token;
      downloadUrl = b2Auth.downloadUrl;
    }
  }

  let url = `${downloadUrl}/file/${bucket}/${filePath}`;
  if (authToken) url += `?Authorization=${encodeURIComponent(authToken)}`;
  return url;
}

function forwardHeaders(b2Response: Response, extra: string[] = []): HeadersInit {
  const headers: HeadersInit = {};
  const toForward = [
    'content-type',
    'content-length',
    'content-disposition',
    'content-encoding',
    'cache-control',
    'etag',
    'last-modified',
    'accept-ranges',
    'vary',
    ...extra,
  ];

  for (const h of toForward) {
    const v = b2Response.headers.get(h);
    if (v) headers[h] = v;
  }
  return headers;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { path } = await context.params;
    const b2Url = await buildB2Url(path, request);
    
    if (!b2Url) {
      return NextResponse.json({ error: 'Bucket name required' }, { status: 400 });
    }

    const headers: HeadersInit = {};
    const url = new URL(request.url);

    // Forward common conditional headers for better cache + resume correctness.
    for (const h of ['if-none-match', 'if-modified-since', 'if-range'] as const) {
      const v = request.headers.get(h);
      if (v) headers[h] = v;
    }

    // Range support (header first). Also allow a query param fallback for clients
    // that can't easily set the Range header.
    const range = request.headers.get('range') ?? url.searchParams.get('range') ?? url.searchParams.get('Range');

    // Optional serverless-friendly chunking: if no Range is provided, callers can request
    // fixed-size ranges via ?chunkSize=<bytes>&chunk=<index>.
    // NOTE: This does not "auto-download" the full file; the client must request each chunk.
    const chunkSizeRaw = url.searchParams.get('chunkSize');
    const chunkIndexRaw = url.searchParams.get('chunk') ?? url.searchParams.get('chunkIndex');

    if (range) {
      headers['range'] = range;
    } else if (chunkSizeRaw && chunkIndexRaw) {
      const chunkSize = Number(chunkSizeRaw);
      const chunkIndex = Number(chunkIndexRaw);
      if (Number.isFinite(chunkSize) && Number.isFinite(chunkIndex) && chunkSize > 0 && chunkIndex >= 0) {
        const start = Math.floor(chunkIndex * chunkSize);
        const end = Math.floor(start + chunkSize - 1);
        headers['range'] = `bytes=${start}-${end}`;
      }
    }

    const b2Response = await fetch(b2Url, { headers });

    if (!b2Response.ok) {
      return new NextResponse(await b2Response.text(), {
        status: b2Response.status,
        statusText: b2Response.statusText,
      });
    }

    // Wrap the response body in a passthrough stream to measure bytes + speed.
    const transferStart = Date.now();
    let byteCount = 0;
    const bucket = path[0];
    const file = path.slice(1).join('/');
    const status = b2Response.status;
    const contentType = b2Response.headers.get('content-type') ?? undefined;

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        byteCount += chunk.byteLength;
        controller.enqueue(chunk);
      },
      flush() {
        const durationMs = Date.now() - transferStart;
        void track('file-proxied', {
          bucket,
          file,
          status,
          contentType,
          bytes: byteCount,
          durationMs,
          // KB/s throughput measured from first byte to stream close
          speedKBps: durationMs > 0 ? Math.round((byteCount / 1024) / (durationMs / 1000)) : 0,
        });
      },
    });

    if (b2Response.body) {
      b2Response.body.pipeTo(writable).catch(() => { /* client disconnected */ });
    } else {
      writable.close();
    }

    return new NextResponse(readable, {
      status: b2Response.status,
      headers: forwardHeaders(b2Response, ['content-range']),
    });
  } catch (error) {
    console.error('B2 Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: String(error) }, { status: 500 });
  }
}

export async function HEAD(request: NextRequest, context: RouteParams) {
  try {
    const { path } = await context.params;
    const b2Url = await buildB2Url(path, request);
    
    if (!b2Url) {
      return NextResponse.json({ error: 'Bucket name required' }, { status: 400 });
    }

    const b2Response = await fetch(b2Url, { method: 'HEAD' });

    return new NextResponse(null, {
      status: b2Response.status,
      headers: forwardHeaders(b2Response),
    });
  } catch (error) {
    console.error('B2 Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: String(error) }, { status: 500 });
  }
}
