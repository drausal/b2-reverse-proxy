#!/usr/bin/env python3
"""
Example: Using the B2 S3 Proxy with boto3
"""

import boto3
from botocore.exceptions import ClientError

# Configure S3 client to use the proxy
s3 = boto3.client(
    's3',
    endpoint_url='http://localhost:3000/api/s3',
    aws_access_key_id='YOUR_B2_KEY_ID',
    aws_secret_access_key='YOUR_B2_APPLICATION_KEY',
    region_name='us-west-004'
)

def list_buckets():
    """List all buckets"""
    try:
        response = s3.list_buckets()
        print("Buckets:")
        for bucket in response['Buckets']:
            print(f"  - {bucket['Name']}")
    except ClientError as e:
        print(f"Error: {e}")

def upload_file(local_path, bucket, key):
    """Upload a file to B2"""
    try:
        s3.upload_file(local_path, bucket, key)
        print(f"Uploaded {local_path} to s3://{bucket}/{key}")
    except ClientError as e:
        print(f"Error: {e}")

def download_file(bucket, key, local_path):
    """Download a file from B2"""
    try:
        s3.download_file(bucket, key, local_path)
        print(f"Downloaded s3://{bucket}/{key} to {local_path}")
    except ClientError as e:
        print(f"Error: {e}")

def list_objects(bucket, prefix=''):
    """List objects in a bucket"""
    try:
        response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
        if 'Contents' in response:
            print(f"Objects in {bucket}/{prefix}:")
            for obj in response['Contents']:
                print(f"  - {obj['Key']} ({obj['Size']} bytes)")
        else:
            print(f"No objects found in {bucket}/{prefix}")
    except ClientError as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    # Example usage
    list_buckets()
    # upload_file('test.txt', 'my-bucket', 'test.txt')
    # download_file('my-bucket', 'test.txt', 'downloaded.txt')
    # list_objects('my-bucket')
