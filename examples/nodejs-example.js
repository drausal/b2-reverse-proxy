/**
 * Example: Using the B2 S3 Proxy with AWS SDK v3 for JavaScript
 * 
 * Install dependencies:
 * npm install @aws-sdk/client-s3
 */

import { 
  S3Client, 
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync } from 'fs';

// Configure S3 client to use the proxy
const s3Client = new S3Client({
  endpoint: 'http://localhost:3000/api/s3',
  region: 'us-west-004',
  credentials: {
    accessKeyId: 'YOUR_B2_KEY_ID',
    secretAccessKey: 'YOUR_B2_APPLICATION_KEY',
  },
  forcePathStyle: true,
});

async function listBuckets() {
  try {
    const response = await s3Client.send(new ListBucketsCommand({}));
    console.log('Buckets:');
    response.Buckets?.forEach(bucket => {
      console.log(`  - ${bucket.Name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function listObjects(bucket, prefix = '') {
  try {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    }));
    
    console.log(`Objects in ${bucket}/${prefix}:`);
    response.Contents?.forEach(obj => {
      console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function uploadFile(localPath, bucket, key) {
  try {
    const fileContent = readFileSync(localPath);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
    }));
    
    console.log(`Uploaded ${localPath} to s3://${bucket}/${key}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function downloadFile(bucket, key, localPath) {
  try {
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
    
    const bodyContents = await response.Body.transformToByteArray();
    writeFileSync(localPath, bodyContents);
    
    console.log(`Downloaded s3://${bucket}/${key} to ${localPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteFile(bucket, key) {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
    
    console.log(`Deleted s3://${bucket}/${key}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage
(async () => {
  await listBuckets();
  // await listObjects('my-bucket');
  // await uploadFile('test.txt', 'my-bucket', 'test.txt');
  // await downloadFile('my-bucket', 'test.txt', 'downloaded.txt');
  // await deleteFile('my-bucket', 'test.txt');
})();
