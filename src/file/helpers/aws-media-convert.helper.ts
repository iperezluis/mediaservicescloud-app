import { MediaConvertClient } from '@aws-sdk/client-mediaconvert';

// const base64: Encoder = {};
export const mediaConvertClient = () =>
  new MediaConvertClient({
    region: process.env.AWS_REGION_NAME,
    credentials: {
      accessKeyId: process.env.AWS_PUBLIC_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    endpoint: 'https://q25wbt2lc.mediaconvert.us-east-1.amazonaws.com',
    // base64Encoder: ""
    // urlParser:
  });
