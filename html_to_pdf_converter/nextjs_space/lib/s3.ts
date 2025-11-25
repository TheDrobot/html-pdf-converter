
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

let s3Client: S3Client | null = null;
let bucketName = "";
let folderPrefix = "";

// Lazy initialization
function initS3() {
  if (!s3Client) {
    s3Client = createS3Client();
    if (s3Client) {
      const config = getBucketConfig();
      bucketName = config.bucketName;
      folderPrefix = config.folderPrefix;
    }
  }
  return s3Client;
}

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const client = initS3();
  if (!client) {
    throw new Error("S3 is not configured. Please set AWS credentials in environment variables.");
  }

  const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`;

  await client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'text/html'
  }));

  return key;
}

export async function downloadFile(key: string): Promise<string> {
  const client = initS3();
  if (!client) {
    throw new Error("S3 is not configured. Please set AWS credentials in environment variables.");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  return signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  const client = initS3();
  if (!client) {
    throw new Error("S3 is not configured. Please set AWS credentials in environment variables.");
  }

  await client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  }));
}

export async function getFileContent(key: string): Promise<string> {
  try {
    const client = initS3();
    if (!client) {
      throw new Error("S3 is not configured. Please set AWS credentials in environment variables.");
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const response = await client.send(command);
    const str = await response.Body?.transformToString();
    return str || '';
  } catch (error) {
    console.error('Error getting file content:', error);
    return '';
  }
}
