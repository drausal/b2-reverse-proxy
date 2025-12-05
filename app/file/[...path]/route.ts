import { NextRequest, NextResponse } from 'next/server';

// Backblaze B2 native download endpoint
const B2_DOWNLOAD_URL = process.env.B2_DOWNLOAD_URL || 'https://f005.backblazeb2.com';

// B2 credentials for private buckets (from env)
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APP_KEY = process.env.B2_APP_KEY;

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

// Cache for B2 auth token
let cachedAuth: { token: string; downloadUrl: string; expiry: number } | null = null;

async function getB2Auth(): Promise<{ token: string; downloadUrl: string } | null> {
  if (!B2_KEY_ID || !B2_APP_KEY) return null;
  
  // Return cached token if still valid (tokens last 24h, cache for 23h)
  if (cachedAuth && Date.now() < cachedAuth.expiry) {
    return { token: cachedAuth.token, downloadUrl: cachedAuth.downloadUrl };
  }

  // Authorize with B2
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
    expiry: Date.now() + (23 * 60 * 60 * 1000),
  };

  return { token: cachedAuth.token, downloadUrl: cachedAuth.downloadUrl };
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { path } = await context.params;
    const url = new URL(request.url);
    
    if (path.length < 1) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      );
    }

    // First segment is the bucket, rest is the file path
    const bucket = path[0];
    const filePath = path.slice(1).join('/');
    
    // Check for auth token in request URL (user-provided)
    const userToken = url.searchParams.get('Authorization');
    
    // Get auth: priority is user token > env credentials > none (public)
    let downloadUrl = B2_DOWNLOAD_URL;
    let authToken: string | null = userToken;
    
    if (!authToken && B2_KEY_ID && B2_APP_KEY) {
      const b2Auth = await getB2Auth();
      if (b2Auth) {
        authToken = b2Auth.token;
        downloadUrl = b2Auth.downloadUrl;
      }
    }
    
    // Construct B2 download URL with auth token as query param
    let b2Url = `${downloadUrl}/file/${bucket}/${filePath}`;
    if (authToken) {
      b2Url += `?Authorization=${encodeURIComponent(authToken)}`;
    }

    // Build headers
    const headers: HeadersInit = {};
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['range'] = rangeHeader;
    }

    // Fetch from B2
    const b2Response = await fetch(b2Url, { headers });

    if (!b2Response.ok) {
      return new NextResponse(await b2Response.text(), {
        status: b2Response.status,
        statusText: b2Response.statusText,
      });
    }

    // Forward response with headers
    const responseHeaders: HeadersInit = {};
    
    // Forward important headers
    const headersToForward = [
      'content-type',
      'content-length',
      'content-disposition',
      'cache-control',
      'etag',
      'last-modified',
      'accept-ranges',
      'content-range',
    ];
    
    for (const header of headersToForward) {
      const value = b2Response.headers.get(header);
      if (value) {
        responseHeaders[header] = value;
      }
    }

    const body = await b2Response.arrayBuffer();

    return new NextResponse(body, {
      status: b2Response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('B2 Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest, context: RouteParams) {
  try {
    const { path } = await context.params;
    const url = new URL(request.url);
    
    if (path.length < 1) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      );
    }

    const bucket = path[0];
    const filePath = path.slice(1).join('/');
    
    // Check for auth token in request URL (user-provided)
    const userToken = url.searchParams.get('Authorization');
    
    // Get auth: priority is user token > env credentials > none (public)
    let downloadUrl = B2_DOWNLOAD_URL;
    let authToken: string | null = userToken;
    
    if (!authToken && B2_KEY_ID && B2_APP_KEY) {
      const b2Auth = await getB2Auth();
      if (b2Auth) {
        authToken = b2Auth.token;
        downloadUrl = b2Auth.downloadUrl;
      }
    }
    
    // Construct B2 download URL with auth token as query param
    let b2Url = `${downloadUrl}/file/${bucket}/${filePath}`;
    if (authToken) {
      b2Url += `?Authorization=${encodeURIComponent(authToken)}`;
    }

    const b2Response = await fetch(b2Url, { method: 'HEAD' });

    const responseHeaders: HeadersInit = {};
    const headersToForward = [
      'content-type',
      'content-length',
      'content-disposition',
      'cache-control',
      'etag',
      'last-modified',
      'accept-ranges',
    ];
    
    for (const header of headersToForward) {
      const value = b2Response.headers.get(header);
      if (value) {
        responseHeaders[header] = value;
      }
    }

    return new NextResponse(null, {
      status: b2Response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('B2 Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}
