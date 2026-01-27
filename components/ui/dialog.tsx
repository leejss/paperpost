"use client"

import { type ReactNode, useEffect, useRef } from "react"

interface DialogProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	title?: string
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open) {
			dialog.showModal()
		} else {
			dialog.close()
		}
	}, [open])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		const handleClose = () => onClose()
		dialog.addEventListener("close", handleClose)
		return () => dialog.removeEventListener("close", handleClose)
	}, [onClose])

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === dialogRef.current) {
			onClose()
		}
	}

	return (
		<dialog
			ref={dialogRef}
			onClick={handleBackdropClick}
			className="backdrop:bg-black/50 bg-transparent p-0 max-w-lg w-full"
		>
			<div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-xl">
				{title && (
					<h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{title}</h2>
				)}
				{children}
			</div>
		</dialog>
	)
}
