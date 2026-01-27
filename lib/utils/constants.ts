export const MAX_FILE_SIZE_BYTES = 1024 * 1024 // 1MB

export const EXPIRY_OPTIONS = {
	"1d": { label: "1일", days: 1 },
	"7d": { label: "7일", days: 7 },
	"30d": { label: "30일", days: 30 },
	permanent: { label: "영구", days: null },
} as const

export type ExpiryOption = keyof typeof EXPIRY_OPTIONS

export const DEFAULT_EXPIRY: ExpiryOption = "7d"

export const CACHE_REVALIDATE_SECONDS = 300 // 5분

export function getExpiresAt(option: ExpiryOption): Date | null {
	const config = EXPIRY_OPTIONS[option]
	if (config.days === null) {
		return null
	}
	const date = new Date()
	date.setDate(date.getDate() + config.days)
	return date
}
