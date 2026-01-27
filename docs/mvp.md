# Markdown Share (LLM Artifact Share) — MVP 설계 정리

## 1. 목표 / 문제 정의

- LLM(ChatGPT/Claude 등)에서 생성된 **마크다운 아티팩트만** 대화 맥락 없이 깔끔하게 공유하고 싶다.
- 복사/붙여넣기 공유는 휴먼 리더블하지 않고, 챗봇 내장 Share는 대화 전체가 함께 공유되는 문제가 있다.

## 2. 핵심 사용자 플로우

1. 사용자가 사이트 접속
2. 마크다운 에디터에서 작성/붙여넣기
3. **Share** 버튼 클릭
4. 공유 링크 생성(퍼블릭 접근 가능)
5. 공유 페이지에서
  - 렌더(Reader View)
  - 원문(Raw)
  - 다운로드(.md)

## 3. 스택(확정)

- **Framework**: Next.js (App Router)
- **Hosting/Compute**: Vercel
- **DB**: Postgres (Neon)
- **ORM**: Drizzle ORM
- **Object Storage**: Cloudflare R2
- **Markdown Editor**: `@mdxeditor/editor`

## 4. 저장 전략(중요)

저장 전략(중요)

- **DB(Neon)에는 본문을 저장하지 않는다.**
- 본문(마크다운)은 **R2에 객체로 저장**한다.
- DB에는 문서 메타데이터만 저장한다(권한/만료/상태/삭제 권한 등).

## 5. 렌더링/서빙 전략 (결정)

- **Option A 채택**: `/d/[id]` 접근 시 **서버에서 on-demand로 md를 가져와 렌더**한다.
- 문서는 **Immutable(한번 공유하면 수정 불가)** 전제로 설계한다.
- 성능/비용 최적화를 위해 **캐싱(revalidate)** 를 적용해 R2 fetch/렌더 빈도를 낮춘다.

### `/d/[id]` 요청 시 동작(Option A)

1. DB(Neon)에서 메타데이터 조회
  - 존재 여부, `status`(active/pending), `expires_at`, `visibility` 체크
2. R2에서 md 객체 GET (`r2_key`)
3. 서버에서 Markdown → HTML 렌더 + sanitize
4. HTML 응답 반환

> 트래픽이 커지면 확장 옵션으로 "HTML을 R2에 캐시 저장(Option B)" 또는 Cloudflare 서빙 분리를 고려할 수 있으나, MVP는 Option A로 간다.

## 6. Server Actions 사용 방식(권장 패턴)

- App Router + **Server Actions** 사용
- Server Action은 ‘트랜잭션/메타데이터’ 중심으로만 처리
- 본문 업로드는 **클라이언트 → R2 직행(presigned URL)**

### 추천 업로드 흐름

1. Share 클릭 → `createDocAction()` 호출

- 서버에서:
  - 문서 id 생성
  - DB row 생성(status = `pending`)
  - R2 presigned PUT URL 발급
  - 반환: `{ id, viewUrl, putUrl, r2Key, ownerToken }`

1. 클라이언트가 `putUrl`로 R2 업로드
2. 업로드 성공 후 `confirmUploadAction(id)` 호출

- 서버에서 (선택): R2 head 확인 후
- DB status를 `active`로 변경

## 6. 문서 상태 모델

- `pending`: DB row는 존재하지만 R2 업로드 전/실패
- `active`: R2 업로드 완료(정상 공유 가능)
- `deleted`: 작성자 삭제됨
- `blocked`: 남용/정책 위반으로 차단

## 7. 권한/가시성 (결정)

- 기본값: **Unlisted** (링크를 아는 사람만 접근)
- 옵션:
  - Public
  - Password 보호(추후)

## 8. 만료 정책 (결정)

- 만료 preset: **1일 / 7일(기본) / 30일 / 영구**
- 만료 문서 응답: **410 (Gone)** + 만료 안내 화면

## 9. 문서 ID / URL 정책 (결정)

- 문서 ID: **nanoid (10~12 chars)**
- URL:
  - View: `/d/<id>`
  - Raw: `/raw/<id>`
  - Download: `/download/<id>.md`

## 10. 업로드 확정(2단계) 및 삭제 권한 (결정)

- 업로드 확정: `createDocAction()` 이후 클라이언트 업로드 성공 시 `confirmUploadAction(id)` 호출
- 삭제 권한: 로그인 없이 **owner token** 방식
  - 서버가 `ownerToken` 발급
  - DB에는 `owner_token_hash`만 저장
  - 삭제는 `deleteDocAction(id, ownerToken)` 형태(또는 delete URL 제공)

## 11. 제한/캐싱 (결정)

- 문서 최대 크기: **1MB**
- 캐싱(revalidate): **300초(5분)** 로 시작

## 12. 라우트/엔드포인트 초안 (App Router)

- `app/page.tsx`: 에디터
- `app/d/[id]/page.tsx`: 공유 뷰(렌더)
- `app/raw/[id]/route.ts`: 원문 md 제공
- `app/download/[id]/route.ts`: 다운로드(.md) (Content-Disposition)
- `app/actions.ts`: server actions (create/confirm/delete 등)

## 9. DB 스키마 초안 (Neon)

`documents`

- `id` (uuid 또는 nanoid)
- `r2_key` (예: `docs/{id}.md`)
- `title` (optional; 첫 H1에서 추출 가능)
- `visibility` (`public` | `unlisted` | `password`)
- `password_hash` (nullable)
- `expires_at` (nullable)
- `owner_token_hash` (삭제 권한)
- `status` (`pending` | `active` | `deleted` | `blocked`)
- `size_bytes`
- `created_at`, `updated_at`
- (optional) `render_version` (렌더 정책 변경 대응)

## 10. 보안/운영 MVP 체크리스트(필수급)

- Markdown → HTML 렌더 시 **sanitize/XSS 방지**
  - HTML 태그 기본 비활성화 또는 강력 sanitize
  - 외부 링크 `rel="noopener noreferrer nofollow"`
- 남용 방지
  - 기본 rate limit(생성/조회)
  - 신고/차단 플로우는 후순위로 두되 구조는 열어두기

## 11. 출력/다운로드 범위(현재)

- 공유 페이지에서:
  - Render view
  - Raw view
  - Download: `.md`
- `.pdf` 등은 추후 옵션(유료/고급 기능 후보)

## 12. 이후 확장 아이디어

- PII/Secret 패턴 감지 경고(키/이메일/전화번호 등)
- Mermaid/표 보정/코드 하이라이트 등 LLM 출력 최적화
- 트래픽 증가 시:
  - raw/download 서빙을 Cloudflare(Workers/Pages)로 분리
  - HTML 캐시를 R2에 저장(렌더 비용 감소)

