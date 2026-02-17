"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/configs/supabase.client";
import CreateCronJobModal from "@/components/modals/CreateCronJobModal";
import Link from "next/link";

export const parseCronExpression = (expr) => {
	if (!expr) return "Unknown schedule";

	const parts = expr.trim().split(" ");
	if (parts.length !== 5) return expr;

	const [minute, hour, day, month, weekday] = parts;

	// Every X minutes
	if (
		minute.startsWith("*/") &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		const interval = minute.replace("*/", "");
		return `Every ${interval} minute${interval === "1" ? "" : "s"}`;
	}

	// Hourly
	if (
		minute === "0" &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return "Every hour";
	}

	// Daily
	if (day === "*" && month === "*" && weekday === "*") {
		return `Daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
	}

	// Weekly
	if (day === "*" && month === "*" && weekday !== "*") {
		const days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];

		const dayName = days[parseInt(weekday, 10)] || "Unknown day";

		return `Weekly on ${dayName} at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
	}

	return expr;
};

export default function ProjectDetails() {
	const { projectId } = useParams();
	const router = useRouter();

	const [project, setProject] = useState(null);
	const [cronJobs, setCronJobs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);

	const fetchData = async () => {
		if (!projectId) return;

		setLoading(true);

		const { data: projectData } = await supabase
			.from("projects")
			.select("*")
			.eq("id", projectId)
			.single();

		const { data: cronData } = await supabase
			.from("cron_jobs")
			.select("*")
			.eq("project", projectId)
			.order("created_at", { ascending: false });

		if (projectData) setProject(projectData);
		if (cronData) setCronJobs(cronData);

		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, [projectId]);

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
				onClick={() => router.push("/projects")}
				className="text-sm text-base-content/60 hover:text-base-content"
			>
				← Back to Projects
			</button>

			<div>
				<h1 className="text-3xl font-bold">{project?.name}</h1>

				{project?.description && (
					<p className="text-sm text-base-content/60 mt-2">
						{project.description}
					</p>
				)}
			</div>

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Cron Jobs</h2>

					<button
						onClick={() => setOpen(true)}
						className="btn btn-sm border border-base-300 bg-neutral-800 rounded-md active:bg-neutral-700"
					>
						Create Cron Job
					</button>
				</div>

				{cronJobs.length > 0 ? (
					<div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
						{cronJobs.map((job) => (
							<Link
								key={job.id}
								href={`/projects/${projectId}/cron-jobs/${job.id}`}
								className="card bg-base-200 shadow-md hover:shadow-xl transition border border-base-200 rounded-md"
							>
								<div className="card-body p-5 gap-2">
									<h2 className="card-title">{job.name}</h2>

									<p className="text-xs text-base-content/60">
										{parseCronExpression(
											job.cron_expression,
										)}
									</p>

									<p className="text-xs text-base-content/60 truncate">
										{job.target_url}
									</p>

									<div className="flex justify-between items-center mt-4">
										<span
											className={`px-3 py-1 text-xs rounded-md ${
												job.is_active
													? "bg-success/10 text-success"
													: "bg-error/10 text-error"
											}`}
										>
											{job.is_active
												? "Active"
												: "Inactive"}
										</span>

										<span className="text-xs text-base-content/50">
											Next:{" "}
											{job.next_run_at
												? new Date(
														job.next_run_at,
													).toLocaleString()
												: "-"}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<p className="text-sm text-base-content/60">
							No cron jobs created yet.
						</p>
					</div>
				)}
			</div>

			{/* Modal */}
			<CreateCronJobModal
				open={open}
				onClose={() => setOpen(false)}
				projectId={projectId}
				onSuccess={fetchData}
			/>
		</div>
	);
}
