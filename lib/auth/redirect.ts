const DEFAULT_NEXT_PATH = "/my-docs"

export function getSafeNextPath(next: string | null | undefined) {
	if (!next) {
		return DEFAULT_NEXT_PATH
	}

	if (!next.startsWith("/") || next.startsWith("//")) {
		return DEFAULT_NEXT_PATH
	}

	return next
}
