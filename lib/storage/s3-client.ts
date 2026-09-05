import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ValidationError } from "../utils/errors";

export interface UploadFileInput {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}

export class S3StorageClient {
  private client: S3Client | null = null;
  private bucketName: string;

  constructor() {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.bucketName = bucketName || "";
  }

  private validateCredentials(): void {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error(
        "AWS S3 credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME) must be configured to use file storage"
      );
    }
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.validateCredentials();

      const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
      const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
      const endpoint = process.env.AWS_ENDPOINT_URL || undefined;

      this.bucketName = process.env.AWS_S3_BUCKET_NAME!;

      this.client = new S3Client({
        region,
        endpoint,
        forcePathStyle: !!endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
    return this.client;
  }

  async uploadFile(input: UploadFileInput): Promise<string> {
    if (!input.file || !input.fileName) {
      throw new ValidationError("file buffer and fileName are required");
    }

    const client = this.getClient();
    const folder = input.folder ? `${input.folder}/` : "";
    const key = `${folder}${Date.now()}-${input.fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: input.file,
      ContentType: input.mimeType,
    });

    await client.send(command);

    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrlOrKey: string): Promise<void> {
    if (!fileUrlOrKey) {
      throw new ValidationError("fileUrlOrKey is required");
    }

    const client = this.getClient();
    let key = fileUrlOrKey;

    if (fileUrlOrKey.startsWith("http://") || fileUrlOrKey.startsWith("https://")) {
      const url = new URL(fileUrlOrKey);
      key = url.pathname.substring(1);
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await client.send(command);
  }

  async getSignedDownloadUrl(fileKey: string, expiresSeconds: number = 3600): Promise<string> {
    if (!fileKey) {
      throw new ValidationError("fileKey is required");
    }

    const client = this.getClient();
    let key = fileKey;

    if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
      const url = new URL(fileKey);
      key = url.pathname.substring(1);
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(client, command, { expiresIn: expiresSeconds });
  }
}

export const s3StorageClient = new S3StorageClient();
