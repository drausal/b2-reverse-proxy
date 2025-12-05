# Backblaze B2 Reverse Proxy

A simple Next.js reverse proxy that forwards requests to Backblaze B2's native download API. Serve B2 files from your own domain with the exact same URL path structure.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdrausal%2Fb2-reverse-proxy)

**Live Demo:** https://b2-reverse-proxy.vercel.app

## Features

- 🌐 **Your Domain** - Serve B2 files from your own domain
- ⚡ **Simple Forwarding** - Direct proxy to B2's native download API
- 🔄 **Same URL Structure** - Matches B2's `/file/bucket/path` format exactly
- 📦 **Public Buckets** - Works with public B2 buckets (no auth required)
- 🔒 **Private Buckets** - Supports private buckets via env credentials or URL token
- 🎯 **Range Requests** - Supports partial content / byte-range requests
- 🚀 **Edge Ready** - Deploy on Vercel's edge network

## Usage

Just replace `f005.backblazeb2.com` with your domain:

```bash
# Original B2 URL
https://f005.backblazeb2.com/file/my-bucket/path/to/file.jpg

# Your Custom Domain
https://your-domain.com/file/my-bucket/path/to/file.jpg
```

That's it! No configuration needed for public buckets.

## Setup

### Local Development

```bash
pnpm install
pnpm dev
```

Test it:
```bash
curl http://localhost:3000/file/your-bucket/your-file.jpg
```

### Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Configuration

Set environment variables in `.env.local` (local) or Vercel dashboard (production):

```env
# B2 download endpoint (default: https://f005.backblazeb2.com)
B2_DOWNLOAD_URL=https://f005.backblazeb2.com

# For private buckets: B2 credentials (optional)
# Get these from Backblaze B2 > App Keys
B2_KEY_ID=your_application_key_id
B2_APP_KEY=your_application_key
```

## Private Buckets

Two ways to access private buckets:

### 1. Environment Variables (Recommended)

Set `B2_KEY_ID` and `B2_APP_KEY` in your environment. The proxy will automatically generate and cache auth tokens (valid 24h, cached 23h).

```bash
# Just use the same URL - auth is handled automatically
curl https://your-domain.com/file/private-bucket/secret-file.pdf
```

### 2. URL Parameter

Pass a B2 authorization token in the URL:

```bash
# Get a token from B2 API first, then:
curl "https://your-domain.com/file/private-bucket/secret-file.pdf?Authorization=YOUR_B2_TOKEN"
```

**Priority:** URL token > Environment credentials > Public access

## API

**Endpoint:** `/file/[bucket]/[...path]`

**Methods:** GET, HEAD

**Query Parameters:**
- `Authorization` - B2 auth token (optional, for private buckets)

**Request Headers Forwarded:**
- `Range` (for partial content requests)

**Response Headers Forwarded:**
- `Content-Type`
- `Content-Length`
- `Content-Disposition`
- `Cache-Control`
- `ETag`
- `Last-Modified`
- `Accept-Ranges`
- `Content-Range`

## Examples

```bash
# Public bucket
curl https://b2-reverse-proxy.vercel.app/file/my-public-bucket/image.jpg

# Private bucket (with env credentials configured)
curl https://b2-reverse-proxy.vercel.app/file/my-private-bucket/secret.pdf

# Private bucket (with URL token)
curl "https://b2-reverse-proxy.vercel.app/file/my-private-bucket/secret.pdf?Authorization=4_abc123..."

# Check file info
curl -I https://b2-reverse-proxy.vercel.app/file/my-bucket/file.jpg
```

## License

MIT
