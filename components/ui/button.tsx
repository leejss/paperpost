import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost"
	size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = "", variant = "primary", size = "md", disabled, children, ...props }, ref) => {
		const baseStyles =
			"inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-sm"

		const variants = {
			primary: "bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active",
			secondary:
				"bg-secondary text-secondary-fg hover:bg-secondary-hover active:bg-secondary-active",
			ghost: "hover:bg-bg-muted",
		}

		const sizes = {
			sm: "h-8 px-3 text-sm",
			md: "h-10 px-4 text-sm",
			lg: "h-12 px-6 text-base",
		}

		return (
			<button
				ref={ref}
				className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
				disabled={disabled}
				{...props}
			>
				{children}
			</button>
		)
	}
)

Button.displayName = "Button"
