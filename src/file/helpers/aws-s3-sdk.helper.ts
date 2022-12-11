import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION_NAME,
    credentials: {
      accessKeyId: process.env.AWS_PUBLIC_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });
