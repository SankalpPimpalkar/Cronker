"use client";

import { useMemo } from "react";

export default function JsonViewer({ value }) {
	const formatted = useMemo(() => {
		if (!value) return "";

		try {
			if (typeof value === "object") {
				return JSON.stringify(value, null, 2);
			}

			const parsed = JSON.parse(value);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return value;
		}
	}, [value]);

	return (
		<div className="bg-neutral rounded-md border border-base-300 max-h-80 overflow-auto">
			<textarea
				readOnly
				value={formatted}
				className="w-full bg-transparent p-4 text-xs font-mono leading-5 resize-none focus:outline-none"
				rows={12}
			/>
		</div>
	);
}
