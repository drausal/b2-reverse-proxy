# Backblaze B2 Reverse Proxy

A simple Next.js reverse proxy that forwards requests to Backblaze B2's native download API. Serve B2 files from your own domain with the exact same URL path structure.

**Live Demo:** https://b2-reverse-proxy.vercel.app

## Features

- 🌐 **Your Domain** - Serve B2 files from your own domain
- ⚡ **Simple Forwarding** - Direct proxy to B2's native download API
- 🔄 **Same URL Structure** - Matches B2's `/file/bucket/path` format exactly
- 📦 **Public Buckets** - Works with public B2 buckets (no auth required)
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

Optionally set the B2 download URL in `.env.local`:

```env
# Default: https://f005.backblazeb2.com
B2_DOWNLOAD_URL=https://f005.backblazeb2.com
```

## API

**Endpoint:** `/file/[bucket]/[...path]`

**Methods:** GET, HEAD

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

## Example

```bash
# Download a file
curl https://b2-reverse-proxy.vercel.app/file/dropshare-tech-on-tires/example.pdf -o example.pdf

# Check file info
curl -I https://b2-reverse-proxy.vercel.app/file/dropshare-tech-on-tires/example.pdf
```

## License

MIT
