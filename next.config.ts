import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		// Leave room for JSON escaping in a document of up to 1MB.
		serverActions: { bodySizeLimit: "8mb" },
	},
	async headers() {
		return ["/d/:path*", "/raw/:path*", "/download/:path*"].map((source) => ({
			source,
			headers: [
				{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
				{ key: "X-Content-Type-Options", value: "nosniff" },
				{ key: "Referrer-Policy", value: "no-referrer" },
			],
		}))
	},
}

export default nextConfig
