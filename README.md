# Markdown Share

LLM(ChatGPT/Claude 등)에서 생성된 마크다운 아티팩트를 깔끔하게 공유하는 서비스입니다.

## 기능

- 마크다운 에디터로 작성/붙여넣기
- 공유 링크 생성 (unlisted)
- 만료 기간 설정 (1일/7일/30일/영구)
- 렌더된 뷰, Raw 보기, .md 다운로드
- owner token을 사용한 문서 삭제

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon (Postgres) + Drizzle ORM
- **Storage**: Cloudflare R2
- **Editor**: MDXEditor

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env.local`로 복사하고 값을 채워넣으세요:

```bash
cp .env.example .env.local
```

#### Neon 설정

1. [Neon Console](https://console.neon.tech)에서 프로젝트 생성
2. Connection string 복사 → `DATABASE_URL`에 설정

#### Cloudflare R2 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → 버킷 생성
2. API 토큰 생성 (R2 읽기/쓰기 권한)
3. 환경변수 설정:
   - `R2_ACCOUNT_ID`: Account ID (우측 사이드바에서 확인)
   - `R2_ACCESS_KEY_ID`: API 토큰의 Access Key ID
   - `R2_SECRET_ACCESS_KEY`: API 토큰의 Secret Access Key
   - `R2_BUCKET_NAME`: 버킷 이름

#### R2 CORS 설정

R2 버킷에 CORS 설정이 필요합니다. Cloudflare Dashboard → R2 → 버킷 → Settings → CORS에서:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. 데이터베이스 마이그레이션

```bash
# 마이그레이션 파일 생성
npx drizzle-kit generate

# 마이그레이션 실행
npx drizzle-kit migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 스크립트

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# Drizzle Studio (DB 확인)
npx drizzle-kit studio

# 마이그레이션 생성
npx drizzle-kit generate

# 마이그레이션 실행
npx drizzle-kit migrate
```

## 프로젝트 구조

```
paperpost/
├── app/
│   ├── page.tsx              # 에디터 페이지
│   ├── actions.ts            # Server Actions
│   ├── d/[id]/page.tsx       # 공유 뷰
│   ├── raw/[id]/route.ts     # Raw 엔드포인트
│   └── download/[id]/route.ts # 다운로드 엔드포인트
├── components/
│   ├── ui/                   # 기본 UI 컴포넌트
│   ├── editor/               # 에디터 관련
│   ├── share/                # 공유 다이얼로그
│   └── document/             # 문서 뷰어
├── lib/
│   ├── db/                   # Drizzle 설정 및 쿼리
│   ├── r2/                   # R2 클라이언트
│   ├── markdown/             # 렌더러 (XSS 방지)
│   ├── auth/                 # owner token
│   └── utils/                # 유틸리티
└── types/                    # TypeScript 타입
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | Neon Postgres 연결 문자열 |
| `R2_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | R2 API Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API Secret Access Key |
| `R2_BUCKET_NAME` | R2 버킷 이름 |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (기본: http://localhost:3000) |

## 보안

- Markdown → HTML 렌더링 시 `rehype-sanitize`로 XSS 방지
- 외부 링크에 `rel="noopener noreferrer nofollow"` 적용
- 파일 크기 1MB 제한
- owner token은 SHA-256 해시로 저장
