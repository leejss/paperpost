import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		// Markdown requests need room for JSON escaping; HTML uploads go directly to R2.
		serverActions: { bodySizeLimit: "8mb" },
	},
	async headers() {
		return ["/d/:path*", "/html/:path*", "/raw/:path*", "/download/:path*"].map((source) => ({
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
