import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getDocumentsByUserId } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const statusMeta = {
  pending: {
    label: "처리 중",
    className: "border border-warning-border bg-warning-bg text-warning-fg",
  },
  active: {
    label: "활성",
    className: "border border-success-border bg-success-bg text-success-fg",
  },
  deleted: {
    label: "삭제됨",
    className: "border border-border-default bg-bg-muted text-fg-subtle",
  },
  blocked: {
    label: "차단됨",
    className: "border border-error-border bg-error-bg text-error-fg",
  },
} as const;

const visibilityMeta = {
  public: {
    label: "전체 공개",
    className: "border border-success-border bg-success-bg text-success-fg",
  },
  unlisted: {
    label: "링크 공개",
    className: "border border-border-default bg-bg-muted text-fg-subtle",
  },
  password: {
    label: "비밀번호 보호",
    className: "border border-warning-border bg-warning-bg text-warning-fg",
  },
} as const;

const linkButtonBaseClass =
  "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const ghostLinkClass = `${linkButtonBaseClass} h-8 px-3 text-sm hover:bg-bg-muted`;

const primaryLinkClass = `${linkButtonBaseClass} h-10 px-4 text-sm bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active`;

function formatKoreanDate(value: Date | string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

export default async function MyDocsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login?next=/my-docs");
  }

  const documents = await getDocumentsByUserId(userId);

  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-bg-subtle/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className={`${ghostLinkClass} -ml-2`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              메인으로
            </Link>
            <h1 className="text-lg font-semibold tracking-tight text-fg-default">
              내 문서
            </h1>
          </div>
          <form action="/auth/logout" method="post">
            <Button variant="ghost" size="sm">
              로그아웃
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-default rounded-lg bg-bg-default/50">
            <FileText className="w-12 h-12 text-fg-muted mb-4" />
            <h3 className="text-lg font-medium text-fg-default mb-1">
              작성한 문서가 없습니다
            </h3>
            <p className="text-sm text-fg-muted mb-6">
              새로운 마크다운 문서를 작성하고 공유해보세요.
            </p>
            <Link href="/" className={primaryLinkClass}>
              새 문서 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <article
                key={doc.id}
                className="group relative rounded-lg border border-border-default bg-bg-default p-4 transition-colors hover:border-border-emphasis"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/d/${doc.id}`}
                        className="inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-fg-default hover:text-fg-emphasis"
                      >
                        {doc.id}
                        <ExternalLink className="h-3.5 w-3.5 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta[doc.status].className}`}
                      >
                        {statusMeta[doc.status].label}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${visibilityMeta[doc.visibility].className}`}
                      >
                        {visibilityMeta[doc.visibility].label}
                      </span>
                    </div>
                    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <dt className="sr-only">작성일</dt>
                        <dd>{formatKoreanDate(doc.createdAt)}</dd>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <dt className="sr-only">만료일</dt>
                        <dd>
                          {doc.expiresAt
                            ? `${formatKoreanDate(doc.expiresAt)} 만료`
                            : "영구 보관"}
                        </dd>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <dt className="sr-only">공개 범위</dt>
                        <dd>{visibilityMeta[doc.visibility].label}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border-subtle pt-2 sm:shrink-0 sm:justify-end sm:border-t-0 sm:pt-0 sm:pl-2">
                    <Link
                      href={`/d/${doc.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-xs font-medium text-fg-subtle transition-colors hover:bg-bg-muted hover:text-fg-default"
                    >
                      보기
                    </Link>
                    <Link
                      href={`/download/${doc.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-xs font-medium text-fg-subtle transition-colors hover:bg-bg-muted hover:text-fg-default"
                    >
                      다운로드
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
