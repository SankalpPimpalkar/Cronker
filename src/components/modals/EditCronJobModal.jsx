"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase.client";
import { parseCronExpressionToForm } from "@/lib/cronUtils";

export default function EditCronJobModal({
	open,
	onClose,
	cronJob,
	onSuccess,
}) {
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const [form, setForm] = useState({
		name: "",
		target_url: "",
		http_method: "GET",
		scheduleType: "interval",
		interval: 5,
		time: "00:00",
		weekday: "1",
		is_active: true,
	});

	const [headers, setHeaders] = useState([{ key: "", value: "" }]);
	const [body, setBody] = useState([{ key: "", value: "" }]);

	const mapObjectToPairs = (obj) => {
		if (!obj) return [{ key: "", value: "" }];
		const pairs = Object.entries(obj).map(([key, value]) => ({ key, value }));
		return pairs.length > 0 ? pairs : [{ key: "", value: "" }];
	};

	useEffect(() => {
		if (cronJob && open) {
			const schedule = parseCronExpressionToForm(cronJob.cron_expression);
			
			setForm({
				name: cronJob.name || "",
				target_url: cronJob.target_url || "",
				http_method: cronJob.http_method || "GET",
				scheduleType: schedule.scheduleType,
				interval: schedule.interval,
				time: schedule.time,
				weekday: schedule.weekday,
				is_active: cronJob.is_active ?? true,
			});

			setHeaders(mapObjectToPairs(cronJob.request_headers));
			setBody(mapObjectToPairs(cronJob.request_body));
			setErrors({});
		}
	}, [cronJob, open]);

	const validateForm = () => {
		const newErrors = {};

		if (!form.name.trim()) {
			newErrors.name = "Job name is required";
		}

		if (!form.target_url.trim()) {
			newErrors.target_url = "Target URL is required";
		} else {
			try {
				new URL(form.target_url);
			} catch {
				newErrors.target_url = "Invalid URL format";
			}
		}

		if (form.scheduleType === "interval") {
			const interval = Number(form.interval);
			if (!interval || interval < 5) {
				newErrors.interval = "Minimum interval is 5 minutes";
			}
		}

		const headerKeys = headers.map((h) => h.key.trim()).filter(Boolean);
		const uniqueHeaderKeys = new Set(headerKeys);
		if (headerKeys.length !== uniqueHeaderKeys.size) {
			newErrors.headers = "Duplicate header keys are not allowed";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	if (!open) return null;

	const generateCronExpression = () => {
		switch (form.scheduleType) {
			case "interval":
				return `*/${form.interval} * * * *`;
			case "hourly":
				return `0 * * * *`;
			case "daily": {
				const [hour, minute] = form.time.split(":");
				return `${minute} ${hour} * * *`;
			}
			case "weekly": {
				const [hour, minute] = form.time.split(":");
				return `${minute} ${hour} * * ${form.weekday}`;
			}
			default:
				return "* * * * *";
		}
	};

	const removeHeader = (index) => {
		if (headers.length === 1) return;
		setHeaders(headers.filter((_, i) => i !== index));
	};

	const removeBodyField = (index) => {
		if (body.length === 1) return;
		setBody(body.filter((_, i) => i !== index));
	};

	const buildObjectFromPairs = (pairs) => {
		const obj = {};
		pairs.forEach(({ key, value }) => {
			if (key.trim()) {
				obj[key] = value;
			}
		});
		return Object.keys(obj).length ? obj : null;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			setLoading(true);

			const cronExpression = generateCronExpression();
			const headersObject = buildObjectFromPairs(headers);
			const bodyObject =
				form.http_method !== "GET" ? buildObjectFromPairs(body) : null;

			const { error } = await supabase
				.from("cron_jobs")
				.update({
					name: form.name.trim(),
					cron_expression: cronExpression,
					target_url: form.target_url.trim(),
					http_method: form.http_method,
					request_headers: headersObject,
					request_body: bodyObject,
					is_active: form.is_active,
				})
				.eq("id", cronJob.id);

			if (error) throw error;

			onSuccess();
			onClose();
		} catch (err) {
			console.error(err);
			setErrors({ submit: "Failed to update cron job" });
		} finally {
			setLoading(false);
		}
	};

	const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
	const addBodyField = () => setBody([...body, { key: "", value: "" }]);

	const updateHeader = (index, field, value) => {
		const updated = [...headers];
		updated[index][field] = value;
		setHeaders(updated);
	};

	const updateBody = (index, field, value) => {
		const updated = [...body];
		updated[index][field] = value;
		setBody(updated);
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-base-200/95 backdrop-blur-md border border-base-300/30 shadow-xl p-6 rounded-xl w-full max-w-2xl space-y-4 overflow-y-auto max-h-[90vh]">
				<h2 className="text-lg font-semibold tracking-tight">Edit Cron Job</h2>

				<div>
					<input
						type="text"
						placeholder="Job Name"
						value={form.name}
						onChange={(e) =>
							setForm({ ...form, name: e.target.value })
						}
						className={`input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm ${
							errors.name ? "input-error" : ""
						}`}
					/>
					{errors.name && (
						<p className="text-error text-xs mt-1">{errors.name}</p>
					)}
				</div>

				<div>
					<input
						type="text"
						placeholder="Target URL"
						value={form.target_url}
						onChange={(e) =>
							setForm({
								...form,
								target_url: e.target.value,
							})
						}
						className={`input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm ${
							errors.target_url ? "input-error" : ""
						}`}
					/>
					{errors.target_url && (
						<p className="text-error text-xs mt-1">
							{errors.target_url}
						</p>
					)}
				</div>

				<select
					value={form.http_method}
					onChange={(e) =>
						setForm({
							...form,
							http_method: e.target.value,
						})
					}
					className="select select-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
				>
					<option>GET</option>
					<option>POST</option>
					<option>PUT</option>
					<option>DELETE</option>
				</select>

				{/* Headers */}
				<div>
					<label className="text-sm font-medium">Request Headers</label>

					{headers.map((h, i) => (
						<div key={i} className="flex gap-2 mt-2 items-center">
							<input
								type="text"
								placeholder="Key"
								value={h.key}
								onChange={(e) =>
									updateHeader(i, "key", e.target.value)
								}
								className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
							/>

							<input
								type="text"
								placeholder="Value"
								value={h.value}
								onChange={(e) =>
									updateHeader(i, "value", e.target.value)
								}
								className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
							/>

							<button
								type="button"
								onClick={() => removeHeader(i)}
								disabled={headers.length === 1}
								className="btn btn-square btn-sm btn-ghost text-error"
							>
								✕
							</button>
						</div>
					))}
					{errors.headers && (
						<p className="text-error text-xs mt-2">{errors.headers}</p>
					)}

					<button
						type="button"
						onClick={addHeader}
						className="btn btn-xs mt-3"
					>
						+ Add Header
					</button>
				</div>

				{/* Body */}
				{form.http_method !== "GET" && (
					<div>
						<label className="text-sm font-medium">Request Body</label>

						{body.map((b, i) => (
							<div key={i} className="flex gap-2 mt-2 items-center">
								<input
									type="text"
									placeholder="Key"
									value={b.key}
									onChange={(e) =>
										updateBody(i, "key", e.target.value)
									}
									className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
								/>

								<input
									type="text"
									placeholder="Value"
									value={b.value}
									onChange={(e) =>
										updateBody(i, "value", e.target.value)
									}
									className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
								/>

								<button
									type="button"
									onClick={() => removeBodyField(i)}
									disabled={body.length === 1}
									className="btn btn-square btn-sm btn-ghost text-error"
								>
									✕
								</button>
							</div>
						))}

						<button
							type="button"
							onClick={addBodyField}
							className="btn btn-xs mt-3"
						>
							+ Add Field
						</button>
					</div>
				)}

				{/* Schedule */}
				<div className="space-y-2">
					<label className="label py-0">
						<span className="label-text text-xs text-base-content/60">Schedule</span>
					</label>

					<select
						value={form.scheduleType}
						onChange={(e) =>
							setForm({ ...form, scheduleType: e.target.value })
						}
						className="select select-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
					>
						<option value="interval">Every X Minutes</option>
						<option value="hourly">Every Hour</option>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
					</select>

					{form.scheduleType === "interval" && (
						<input
							type="number"
							min="5"
							value={form.interval}
							onChange={(e) =>
								setForm({ ...form, interval: e.target.value })
							}
							className={`input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm ${
								errors.interval ? "input-error" : ""
							}`}
							placeholder="Minutes (min 5)"
						/>
					)}

					{form.scheduleType === "daily" && (
						<input
							type="time"
							value={form.time}
							onChange={(e) =>
								setForm({ ...form, time: e.target.value })
							}
							className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
						/>
					)}

					{form.scheduleType === "weekly" && (
						<div className="flex gap-2">
							<select
								value={form.weekday}
								onChange={(e) =>
									setForm({ ...form, weekday: e.target.value })
								}
								className="select select-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-1/2 rounded-md transition-all text-sm"
							>
								<option value="0">Sunday</option>
								<option value="1">Monday</option>
								<option value="2">Tuesday</option>
								<option value="3">Wednesday</option>
								<option value="4">Thursday</option>
								<option value="5">Friday</option>
								<option value="6">Saturday</option>
							</select>

							<input
								type="time"
								value={form.time}
								onChange={(e) =>
									setForm({ ...form, time: e.target.value })
								}
								className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-1/2 rounded-md transition-all text-sm"
							/>
						</div>
					)}
				</div>

				{/* Active Toggle */}
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={form.is_active}
						onChange={(e) =>
							setForm({ ...form, is_active: e.target.checked })
						}
						className="toggle toggle-sm toggle-neutral"
					/>
					<span className="text-sm text-base-content/80">Active</span>
				</label>

				<div className="flex justify-end gap-3 mt-6">
					<button
						onClick={onClose}
						className="btn btn-sm border border-base-300 btn-ghost rounded-md font-medium text-xs"
					>
						Cancel
					</button>

					<button
						onClick={handleSubmit}
						disabled={loading}
						className="btn btn-sm bg-neutral text-neutral-content hover:bg-neutral/90 border-none rounded-md shadow-sm transition-all font-medium text-xs"
					>
						{loading ? "Updating..." : "Update"}
					</button>
				</div>
				{errors.submit && (
					<p className="text-error text-center text-sm">{errors.submit}</p>
				)}
			</div>
		</div>
	);
}
