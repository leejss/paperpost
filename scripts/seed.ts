/**
 * 시드 스크립트 - 테스트용 문서 생성
 *
 * 사용법:
 * npx tsx scripts/seed.ts
 *
 * 주의: 이 스크립트는 실제 DB와 R2에 데이터를 생성합니다.
 * .env.local 파일이 설정되어 있어야 합니다.
 */

import "dotenv/config"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { generateOwnerToken, hashOwnerToken } from "../lib/auth/owner-token"
import { getDb } from "../lib/db"
import { documents } from "../lib/db/schema"
import { getR2Bucket, getR2Client } from "../lib/r2/client"
import { getR2Key } from "../lib/r2/presign"
import { generateDocId } from "../lib/utils/id"

const SAMPLE_MARKDOWN = `# 샘플 문서

이것은 **Markdown Share**로 생성된 테스트 문서입니다.

## 특징

- 마크다운 작성 및 공유
- XSS 방지된 안전한 렌더링
- 만료 기간 설정

## 코드 예시

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## 링크

[Markdown Guide](https://www.markdownguide.org/)

---

*이 문서는 시드 스크립트로 생성되었습니다.*
`

async function seed() {
	console.log("시드 시작...\n")

	const docId = generateDocId()
	const r2Key = getR2Key(docId)
	const ownerToken = generateOwnerToken()
	const ownerTokenHash = hashOwnerToken(ownerToken)

	// R2에 마크다운 업로드
	console.log("R2에 파일 업로드 중...")
	await getR2Client().send(
		new PutObjectCommand({
			Bucket: getR2Bucket(),
			Key: r2Key,
			Body: SAMPLE_MARKDOWN,
			ContentType: "text/markdown",
		})
	)
	console.log("R2 업로드 완료")

	// DB에 문서 생성
	console.log("DB에 문서 생성 중...")
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + 7)

	await getDb()
		.insert(documents)
		.values({
			id: docId,
			r2Key,
			title: "샘플 문서",
			visibility: "unlisted",
			passwordHash: null,
			expiresAt,
			ownerTokenHash,
			status: "active",
			sizeBytes: new TextEncoder().encode(SAMPLE_MARKDOWN).length,
		})
	console.log("DB 생성 완료\n")

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

	console.log("====================================")
	console.log("시드 완료!")
	console.log("====================================\n")
	console.log(`문서 ID: ${docId}`)
	console.log(`공유 URL: ${appUrl}/d/${docId}`)
	console.log(`Raw URL: ${appUrl}/raw/${docId}`)
	console.log(`Download URL: ${appUrl}/download/${docId}`)
	console.log(`\n삭제 토큰 (보관하세요): ${ownerToken}`)
	console.log("====================================\n")

	process.exit(0)
}

seed().catch((error) => {
	console.error("시드 실패:", error)
	process.exit(1)
})
