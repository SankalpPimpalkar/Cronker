"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/configs/supabase.client";
import JsonViewer from "@/components/ui/JsonViewer";
import { parseCronExpression } from "../../page";
import { RefreshCw } from "lucide-react";

export default function CronJobDetails() {
	const { cronJobId } = useParams();
	const router = useRouter();

	const [cronJob, setCronJob] = useState(null);
	const [logs, setLogs] = useState([]);
	const [selectedLog, setSelectedLog] = useState(null);
	const [loading, setLoading] = useState(true);
	const [logsLoading, setLogsLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const handleDelete = async () => {
		if (!cronJobId) return;
		setDeleting(true);
		await supabase.from("cron_jobs").delete().eq("id", cronJobId);
		setDeleting(false);
		router.back();
	};

	const fetchLogs = async () => {
		if (!cronJobId) return;

		setLogsLoading(true);

		const { data: logData } = await supabase
			.from("execution_logs")
			.select("*")
			.eq("cron_job", cronJobId)
			.order("executed_at", { ascending: false });

		if (logData) setLogs(logData);

		setLogsLoading(false);
	};

	const fetchData = async () => {
		if (!cronJobId) return;

		setLoading(true);

		const { data: jobData } = await supabase
			.from("cron_jobs")
			.select("*")
			.eq("id", cronJobId)
			.single();

		if (jobData) setCronJob(jobData);

		await fetchLogs();

		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, [cronJobId]);

	if (loading) {
		return (
			<div className="min-h-screen">
				<p className="text-sm text-base-content/60">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<button
				onClick={() => router.back()}
				className="text-sm text-base-content/60 hover:text-base-content"
			>
				← Back
			</button>

			<div className="card bg-base-200 shadow-md border border-base-300 rounded-xl">
				<div className="card-body p-8 space-y-8">
					{/* Top Header Row */}
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								{cronJob?.name}
							</h1>

							<p className="text-sm text-base-content/60 mt-2 break-all">
								{cronJob?.target_url}
							</p>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={() => setShowDeleteModal(true)}
								className="btn btn-sm bg-error/10 text-error rounded-md hover:bg-error/20"
							>
								Delete
							</button>

							<span
								className={`px-4 py-1.5 text-xs font-medium rounded-md ${
									cronJob?.is_active
										? "bg-success/10 text-success"
										: "bg-error/10 text-error"
								}`}
							>
								{cronJob?.is_active ? "Active" : "Inactive"}
							</span>

							<span className="px-4 py-1.5 text-xs font-medium rounded-md bg-neutral border border-base-300">
								{cronJob?.http_method}
							</span>
						</div>
					</div>

					{/* Divider */}
					<div className="divider my-0"></div>

					{/* Metadata Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
						{/* Schedule */}
						<div className="space-y-1">
							<p className="text-base-content/50 uppercase text-xs tracking-wider">
								Schedule
							</p>
							<div className="space-y-1">
								<p className="font-medium">
									{parseCronExpression(
										cronJob?.cron_expression,
									)}
								</p>

								<p className="text-xs text-base-content/40 font-mono">
									{cronJob?.cron_expression}
								</p>
							</div>
						</div>

						{/* Last Run */}
						<div className="space-y-1">
							<p className="text-base-content/50 uppercase text-xs tracking-wider">
								Last Run
							</p>
							<p>
								{cronJob?.last_run_at
									? new Date(
											cronJob.last_run_at,
										).toLocaleString()
									: "-"}
							</p>
						</div>

						{/* Next Run */}
						<div className="space-y-1">
							<p className="text-base-content/50 uppercase text-xs tracking-wider">
								Next Run
							</p>
							<p>
								{cronJob?.next_run_at
									? new Date(
											cronJob.next_run_at,
										).toLocaleString()
									: "-"}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Execution Logs</h2>

					<button
						onClick={fetchLogs}
						disabled={logsLoading}
						className="btn btn-sm border border-base-300 bg-neutral-800 rounded-md active:bg-neutral-700"
					>
						<RefreshCw
							size={16}
							className={`mr-2 ${
								logsLoading ? "animate-spin" : ""
							}`}
						/>
						Reload
					</button>
				</div>

				{logs.length > 0 ? (
					<div className="space-y-2">
						{logs.map((log) => (
							<div
								key={log.id}
								onClick={() => setSelectedLog(log)}
								className="cursor-pointer card bg-base-200 border border-base-200 hover:shadow-lg transition rounded-md"
							>
								<div className="card-body p-4 flex flex-row justify-between items-center">
									<div>
										<p className="text-sm">
											{new Date(
												log.executed_at,
											).toLocaleString()}
										</p>

										<p className="text-xs text-base-content/60">
											Duration: {log.duration_ms} ms
										</p>
									</div>

									<span
										className={`px-3 py-1 text-xs rounded-md ${
											log.is_success
												? "bg-success/10 text-success"
												: "bg-error/10 text-error"
										}`}
									>
										{log.status_code}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-base-content/60">
						No executions yet.
					</p>
				)}
			</div>

			{selectedLog && (
				<div className="modal modal-open">
					<div className="modal-box max-w-4xl bg-base-200">
						<h3 className="font-bold text-lg mb-6">
							Execution Details
						</h3>

						{/* Metadata Section */}
						<div className="grid grid-cols-2 gap-4 text-sm mb-6">
							<div>
								<p className="text-base-content/60">
									Status Code
								</p>
								<p className="font-medium">
									{selectedLog.status_code}
								</p>
							</div>

							<div>
								<p className="text-base-content/60">Success</p>
								<p
									className={
										selectedLog.is_success
											? "text-success font-medium"
											: "text-error font-medium"
									}
								>
									{selectedLog.is_success ? "Yes" : "No"}
								</p>
							</div>

							<div>
								<p className="text-base-content/60">Attempt</p>
								<p>{selectedLog.attempt_number}</p>
							</div>

							<div>
								<p className="text-base-content/60">Duration</p>
								<p>{selectedLog.duration_ms} ms</p>
							</div>

							<div className="col-span-2">
								<p className="text-base-content/60">
									Executed At
								</p>
								<p>
									{new Date(
										selectedLog.executed_at,
									).toLocaleString()}
								</p>
							</div>
						</div>

						{selectedLog.error_message && (
							<div className="mb-6">
								<h4 className="text-sm font-semibold mb-2 text-error">
									Error Message
								</h4>
								<JsonViewer value={selectedLog.error_message} />
							</div>
						)}

						{selectedLog.response_body && (
							<div>
								<h4 className="text-sm font-semibold mb-2">
									Response Body
								</h4>
								<JsonViewer value={selectedLog.response_body} />
							</div>
						)}

						<div className="modal-action">
							<button
								className="btn btn-sm"
								onClick={() => setSelectedLog(null)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{showDeleteModal && (
				<div className="modal modal-open">
					<div className="modal-box bg-base-200">
						<h3 className="font-bold text-lg text-error/80">
							Delete Cron Job
						</h3>

						<p className="py-4 text-sm text-base-content/70">
							Are you sure you want to delete this cron job? This
							action cannot be undone.
						</p>

						<div className="modal-action">
							<button
								className="btn btn-sm"
								onClick={() => setShowDeleteModal(false)}
								disabled={deleting}
							>
								Cancel
							</button>

							<button
								onClick={handleDelete}
								disabled={deleting}
								className="btn btn-sm bg-error/20 text-error rounded-md hover:bg-error/90"
							>
								{deleting ? "Deleting..." : "Confirm Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
