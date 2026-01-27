import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getR2Bucket, getR2Client } from "./client"

const PRESIGNED_URL_EXPIRY_SECONDS = 600 // 10분

export async function createPresignedPutUrl(key: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: getR2Bucket(),
		Key: key,
		ContentType: "text/markdown",
	})

	return getSignedUrl(getR2Client(), command, {
		expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
	})
}

export function getR2Key(docId: string): string {
	return `docs/${docId}.md`
}
