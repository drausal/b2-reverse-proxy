# Backblaze B2 S3-Compatible Reverse Proxy

A Next.js reverse proxy that provides S3-compatible API access to Backblaze B2 storage using your own domain name.

## Features

- 🌐 **S3 API Compatible** - Works with any S3 client (AWS SDK, boto3, s3cmd, etc.)
- 🔄 **Full HTTP Method Support** - GET, PUT, DELETE, HEAD, POST
- 📦 **All S3 Operations** - Upload, download, list, delete objects and buckets
- 🔒 **Secure** - Forwards AWS Signature V4 authentication
- 🎯 **Your Domain** - Serve B2 files from your own domain
- ⚡ **Transparent Proxy** - Preserves all S3 headers and responses

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure B2 S3 endpoint in `.env.local`:
   ```env
   B2_S3_ENDPOINT=s3.us-west-004.backblazeb2.com
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

## Usage

### With AWS CLI

Configure your AWS CLI to use the proxy:

```bash
aws configure set aws_access_key_id YOUR_B2_KEY_ID
aws configure set aws_secret_access_key YOUR_B2_APPLICATION_KEY
aws configure set region us-west-004
```

Use the proxy endpoint:

```bash
# List buckets
aws s3 ls --endpoint-url http://localhost:3000/api/s3

# List objects in a bucket
aws s3 ls s3://my-bucket --endpoint-url http://localhost:3000/api/s3

# Upload a file
aws s3 cp file.jpg s3://my-bucket/file.jpg --endpoint-url http://localhost:3000/api/s3

# Download a file
aws s3 cp s3://my-bucket/file.jpg downloaded.jpg --endpoint-url http://localhost:3000/api/s3
```

### With boto3 (Python)

```python
import boto3

s3 = boto3.client(
    's3',
    endpoint_url='http://localhost:3000/api/s3',
    aws_access_key_id='YOUR_B2_KEY_ID',
    aws_secret_access_key='YOUR_B2_APPLICATION_KEY',
    region_name='us-west-004'
)

# List buckets
response = s3.list_buckets()

# Upload file
s3.upload_file('local.jpg', 'my-bucket', 'remote.jpg')

# Download file
s3.download_file('my-bucket', 'remote.jpg', 'local.jpg')
```

### With AWS SDK for JavaScript

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: 'http://localhost:3000/api/s3',
  region: 'us-west-004',
  credentials: {
    accessKeyId: 'YOUR_B2_KEY_ID',
    secretAccessKey: 'YOUR_B2_APPLICATION_KEY',
  },
  forcePathStyle: true,
});

// Upload
await s3.send(new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'file.jpg',
  Body: fileBuffer,
}));

// Download
const response = await s3.send(new GetObjectCommand({
  Bucket: 'my-bucket',
  Key: 'file.jpg',
}));
```

## API Endpoint

**Base URL:** `/api/s3/[...path]`

**Supported Methods:** GET, HEAD, PUT, POST, DELETE

**Forwarded Headers:**
- Authorization (AWS Signature V4)
- Content-Type, Content-Length, Content-MD5
- All x-amz-* headers
- Range, If-Match, If-None-Match, If-Modified-Since, If-Unmodified-Since

**Response Headers:**
- All standard S3 response headers
- ETag, Last-Modified, Content-Type
- x-amz-* headers from B2

## B2 Region Endpoints

- `s3.us-west-001.backblazeb2.com` - US West (Phoenix, Arizona)
- `s3.us-west-002.backblazeb2.com` - US West (Sacramento, California)
- `s3.us-west-004.backblazeb2.com` - US West (Oregon)
- `s3.us-east-005.backblazeb2.com` - US East (Washington, DC)
- `s3.eu-central-003.backblazeb2.com` - EU Central (Amsterdam)

Set your region in `.env.local`.

## Deployment

### Vercel

```bash
vercel
```

Add `B2_S3_ENDPOINT` to your environment variables in the Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Notes

- Use HTTPS in production to protect credentials
- Consider implementing rate limiting
- Monitor usage to prevent abuse
- Keep your B2 credentials secure

## License

MIT
