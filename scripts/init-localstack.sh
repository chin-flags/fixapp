#!/bin/bash

echo "Initializing LocalStack S3..."

# Create S3 bucket
awslocal s3 mb s3://fixapp-files

# Enable versioning
awslocal s3api put-bucket-versioning \
  --bucket fixapp-files \
  --versioning-configuration Status=Enabled

# Enable server-side encryption (SSE-S3)
awslocal s3api put-bucket-encryption \
  --bucket fixapp-files \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

echo "LocalStack S3 bucket 'fixapp-files' created with versioning and encryption enabled"
