"use client"

import { Select } from "@/components/ui/select"
import { EXPIRY_OPTIONS, type ExpiryOption } from "@/lib/utils/constants"

interface ExpirySelectorProps {
	value: ExpiryOption
	onChange: (value: ExpiryOption) => void
}

export function ExpirySelector({ value, onChange }: ExpirySelectorProps) {
	const options = Object.entries(EXPIRY_OPTIONS).map(([key, config]) => ({
		value: key,
		label: config.label,
	}))

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">만료 기간</label>
			<Select
				value={value}
				onChange={(e) => onChange(e.target.value as ExpiryOption)}
				options={options}
			/>
		</div>
	)
}
