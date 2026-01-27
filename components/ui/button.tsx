import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost"
	size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = "", variant = "primary", size = "md", disabled, children, ...props }, ref) => {
		const baseStyles =
			"inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg"

		const variants = {
			primary:
				"bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
			secondary:
				"bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
			ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
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
