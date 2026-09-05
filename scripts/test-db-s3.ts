import { PrismaClient } from "@prisma/client";
import { s3StorageClient } from "../lib/storage/s3-client";

async function runTests() {
  console.log("=========================================");
  console.log("   LedgerOne: DB & S3 Diagnostic Test    ");
  console.log("=========================================\n");

  // 1. Test Database Connection
  console.log("🔍 [1/2] Testing PostgreSQL Database Connection...");
  const prisma = new PrismaClient();
  try {
    const startTime = Date.now();
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as connected, current_database(), current_user, version();`;
    const elapsed = Date.now() - startTime;
    console.log("✅ Database Connected Successfully!");
    console.log("   Latency:", `${elapsed}ms`);
    console.log("   Details:", result);

    const userCount = await prisma.user.count().catch((e: any) => `Error querying users: ${e.message}`);
    console.log("   User records count:", userCount);
  } catch (err: any) {
    console.error("❌ Database Connection Failed:");
    console.error("   Error:", err.message || err);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n-----------------------------------------\n");

  // 2. Test S3 Storage Client
  console.log("🔍 [2/2] Testing AWS S3 / LocalStack Storage...");
  console.log("   Target Bucket:", process.env.AWS_S3_BUCKET_NAME);
  console.log("   Endpoint:", process.env.AWS_ENDPOINT_URL || "Default AWS");
  try {
    const testFileName = `test-healthcheck-${Date.now()}.txt`;
    const testContent = Buffer.from("Hello from LedgerOne S3 connectivity test!");
    
    console.log(`   Uploading test file (${testFileName})...`);
    const fileUrl = await s3StorageClient.uploadFile({
      file: testContent,
      fileName: testFileName,
      mimeType: "text/plain",
      folder: "healthcheck",
    });
    console.log("✅ S3 Upload Successful!");
    console.log("   File URL:", fileUrl);

    console.log("   Generating signed download URL...");
    const signedUrl = await s3StorageClient.getSignedDownloadUrl(fileUrl, 300);
    console.log("✅ S3 Signed URL Generated!");
    console.log("   Signed URL:", signedUrl);

    console.log("   Cleaning up test file...");
    await s3StorageClient.deleteFile(fileUrl);
    console.log("✅ S3 File Deletion Successful!");
  } catch (err: any) {
    console.error("❌ S3 Storage Test Failed:");
    console.error("   Error:", err.message || err);
  }

  console.log("\n=========================================");
  console.log("             Test Finished               ");
  console.log("=========================================");
}

runTests();
