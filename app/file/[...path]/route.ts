import { NextRequest, NextResponse } from 'next/server';

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

  const bucket = path[0];
  const filePath = path.slice(1).join('/');
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
  const toForward = ['content-type', 'content-length', 'content-disposition', 'cache-control', 'etag', 'last-modified', 'accept-ranges', ...extra];
  
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
    const range = request.headers.get('range');
    if (range) headers['range'] = range;

    const b2Response = await fetch(b2Url, { headers });

    if (!b2Response.ok) {
      return new NextResponse(await b2Response.text(), {
        status: b2Response.status,
        statusText: b2Response.statusText,
      });
    }

    return new NextResponse(await b2Response.arrayBuffer(), {
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
