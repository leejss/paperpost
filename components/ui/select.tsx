"use client"

import { forwardRef, type SelectHTMLAttributes } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ className = "", options, ...props }, ref) => {
		return (
			<select
				ref={ref}
				className={`h-10 w-full rounded-sm border border-border-default bg-bg-default px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-fg-default ${className}`}
				{...props}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		)
	}
)

Select.displayName = "Select"
