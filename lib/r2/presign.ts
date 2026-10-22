import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { type DocumentFormat, getDocumentContentType } from "@/lib/documents/format"
import { getR2Bucket, getR2Client } from "./client"

export function getR2Key(docId: string, format: DocumentFormat = "markdown"): string {
	return `docs/${docId}.${format === "html" ? "html" : "md"}`
}

export function createUploadCommand(
	bucket: string,
	key: string,
	sizeBytes: number,
	format: DocumentFormat
) {
	return new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		ContentLength: sizeBytes,
		ContentType: getDocumentContentType(format),
		// An upload URL must not overwrite a document after it is shared.
		IfNoneMatch: "*",
	})
}

export const UPLOAD_SIGNABLE_HEADERS = new Set(["content-type", "content-length", "if-none-match"])

export async function createPresignedUploadUrl(
	key: string,
	sizeBytes: number,
	format: DocumentFormat
): Promise<string> {
	return getSignedUrl(getR2Client(), createUploadCommand(getR2Bucket(), key, sizeBytes, format), {
		expiresIn: 300,
		signableHeaders: UPLOAD_SIGNABLE_HEADERS,
	})
}
