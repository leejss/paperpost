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

	return (
		<dialog
			ref={dialogRef}
			className="backdrop:bg-bg-inverse/50 bg-transparent p-0 max-w-lg w-full m-auto open:flex open:flex-col open:justify-center open:items-center"
		>
			<div className="bg-bg-default rounded-xl p-6 shadow-xl w-full">
				{title && <h2 className="text-lg font-semibold mb-4 text-fg-default">{title}</h2>}
				{children}
			</div>
		</dialog>
	)
}
