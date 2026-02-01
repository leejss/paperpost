import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getR2Bucket, getR2Client } from "./client"

export async function getMarkdownFromR2(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: getR2Bucket(),
		Key: key,
	})

	const response = await getR2Client().send(command)
	const body = await response.Body?.transformToString()

	if (!body) {
		throw new Error("Failed to fetch markdown from R2")
	}

	return body
}

export async function headObject(key: string): Promise<boolean> {
	try {
		const command = new HeadObjectCommand({
			Bucket: getR2Bucket(),
			Key: key,
		})
		await getR2Client().send(command)
		return true
	} catch {
		return false
	}
}

export async function deleteObject(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: getR2Bucket(),
		Key: key,
	})
	await getR2Client().send(command)
}

export async function uploadObject(key: string, body: string): Promise<void> {
	const command = new PutObjectCommand({
		Bucket: getR2Bucket(),
		Key: key,
		Body: body,
		ContentType: "text/markdown",
	})
	await getR2Client().send(command)
}
