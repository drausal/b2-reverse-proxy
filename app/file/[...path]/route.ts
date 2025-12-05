import { NextRequest, NextResponse } from 'next/server';

// Backblaze B2 native download endpoint
const B2_DOWNLOAD_URL = process.env.B2_DOWNLOAD_URL || 'https://f005.backblazeb2.com';

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { path } = await context.params;
    
    if (path.length < 1) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      );
    }

    // First segment is the bucket, rest is the file path
    const bucket = path[0];
    const filePath = path.slice(1).join('/');
    
    // Construct B2 download URL
    const b2Url = `${B2_DOWNLOAD_URL}/file/${bucket}/${filePath}`;

    // Fetch from B2
    const b2Response = await fetch(b2Url, {
      headers: {
        'range': request.headers.get('range') || '',
      },
    });

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
    
    if (path.length < 1) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      );
    }

    const bucket = path[0];
    const filePath = path.slice(1).join('/');
    const b2Url = `${B2_DOWNLOAD_URL}/file/${bucket}/${filePath}`;

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
