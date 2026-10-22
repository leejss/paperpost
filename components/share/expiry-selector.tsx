"use client"

import { useId } from "react"
import { Select } from "@/components/ui/select"
import { EXPIRY_OPTIONS, type ExpiryOption } from "@/lib/utils/constants"

interface ExpirySelectorProps {
	value: ExpiryOption
	onChange: (value: ExpiryOption) => void
}

export function ExpirySelector({ value, onChange }: ExpirySelectorProps) {
	const selectId = useId()
	const options = Object.entries(EXPIRY_OPTIONS).map(([key, config]) => ({
		value: key,
		label: config.label,
	}))

	return (
		<div className="space-y-2">
			<label htmlFor={selectId} className="text-sm font-medium text-fg-subtle">
				만료 기간
			</label>
			<Select
				id={selectId}
				value={value}
				onChange={(e) => onChange(e.target.value as ExpiryOption)}
				options={options}
			/>
		</div>
	)
}
