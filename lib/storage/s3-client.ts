import AWS from "aws-sdk";
import { ValidationError } from "../utils/errors";

export interface UploadFileInput {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}

export class S3StorageClient {
  private s3: AWS.S3 | null = null;
  private bucketName: string;

  constructor() {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      this.bucketName = "";
    } else {
      this.bucketName = bucketName;
    }
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

  private getS3(): AWS.S3 {
    if (!this.s3) {
      this.validateCredentials();

      const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
      const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
      const endpoint = process.env.AWS_ENDPOINT_URL || undefined;

      this.bucketName = process.env.AWS_S3_BUCKET_NAME!;

      this.s3 = new AWS.S3({
        accessKeyId,
        secretAccessKey,
        region,
        endpoint,
        s3ForcePathStyle: !!endpoint,
        signatureVersion: "v4",
      });
    }
    return this.s3;
  }

  async uploadFile(input: UploadFileInput): Promise<string> {
    if (!input.file || !input.fileName) {
      throw new ValidationError("file buffer and fileName are required");
    }

    const s3 = this.getS3();
    const folder = input.folder ? `${input.folder}/` : "";
    const key = `${folder}${Date.now()}-${input.fileName}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: input.file,
      ContentType: input.mimeType,
    };

    await s3.upload(params).promise();

    const region = process.env.AWS_REGION || "us-east-1";
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrlOrKey: string): Promise<void> {
    if (!fileUrlOrKey) {
      throw new ValidationError("fileUrlOrKey is required");
    }

    const s3 = this.getS3();
    let key = fileUrlOrKey;

    if (fileUrlOrKey.startsWith("http://") || fileUrlOrKey.startsWith("https://")) {
      const url = new URL(fileUrlOrKey);
      key = url.pathname.substring(1);
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    await s3.deleteObject(params).promise();
  }

  async getSignedDownloadUrl(fileKey: string, expiresSeconds: number = 3600): Promise<string> {
    if (!fileKey) {
      throw new ValidationError("fileKey is required");
    }

    const s3 = this.getS3();
    let key = fileKey;

    if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
      const url = new URL(fileKey);
      key = url.pathname.substring(1);
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresSeconds,
    };

    return s3.getSignedUrlPromise("getObject", params);
  }
}

export const s3StorageClient = new S3StorageClient();
