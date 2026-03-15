"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/configs/supabase.client";
import CreateCronJobModal from "@/components/modals/CreateCronJobModal";
import Link from "next/link";

import { parseCronExpression } from "@/lib/cronUtils";
import EditProjectModal from "@/components/modals/EditProjectModal";
import { Zap, Clock, Globe, Plus } from "lucide-react";

export default function ProjectDetails() {
	const { projectId } = useParams();
	const router = useRouter();

	const [project, setProject] = useState(null);
	const [cronJobs, setCronJobs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [deletingProject, setDeletingProject] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const handleDeleteProject = async () => {
		if (!projectId) return;
		setDeletingProject(true);
		await supabase.from("projects").delete().eq("id", projectId);
		setDeletingProject(false);
		router.push("/projects");
	};

	const fetchData = useCallback(async () => {
		if (!projectId) return;

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
	}, [projectId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

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

			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold">{project?.name}</h1>

					{project?.description && (
						<p className="text-sm text-base-content/60 mt-2">
							{project.description}
						</p>
					)}
				</div>

				<div className="flex gap-2">
					<button
						onClick={() => setEditOpen(true)}
						className="btn btn-sm btn-ghost border border-base-300 rounded-md"
					>
						Edit
					</button>
					<button
						onClick={() => setShowDeleteModal(true)}
						className="btn btn-sm bg-error/10 text-error hover:bg-error/20 rounded-md"
					>
						Delete
					</button>
				</div>
			</div>

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Cron Jobs</h2>

					<button
						onClick={() => setOpen(true)}
						className="btn btn-sm bg-neutral text-neutral-content hover:bg-neutral/90 border-none rounded-md shadow-sm transition-all"
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
								className="group bg-base-200/40 backdrop-blur-sm hover:bg-base-200/80 border border-base-300/40 hover:border-neutral-500/30 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
							>
								<div className="space-y-1">
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-2">
											<div className="p-1.5 bg-base-300/30 rounded-lg group-hover:bg-neutral-800 transition-colors">
												<Zap size={14} className="text-base-content/70 group-hover:text-neutral-content" />
											</div>
											<h3 className="text-lg font-semibold tracking-tight">
												{job.name}
											</h3>
										</div>
										<div className="flex items-center gap-1.5 mt-1">
											<span
												className={`h-2 w-2 rounded-full ${
													job.is_active
														? "bg-success animate-pulse"
														: "bg-error"
												}`}
											/>
											<span className="text-xs text-base-content/60">
												{job.is_active
													? "Active"
													: "Inactive"}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-1.5 mt-3">
										<Clock size={12} className="text-base-content/40" />
										<p className="text-xs text-base-content/60">
											{parseCronExpression(job.cron_expression)}
										</p>
									</div>

									<div className="flex items-center gap-1.5 mt-1">
										<Globe size={12} className="text-base-content/40" />
										<p className="text-xs text-base-content/40 truncate">
											{job.target_url}
										</p>
									</div>
								</div>

								<div className="flex justify-end mt-4">
									<span className="text-xs text-base-content/50">
										Next:{" "}
										{job.next_run_at
											? new Date(
													job.next_run_at,
												).toLocaleString([], {
													hour: "2-digit",
													minute: "2-digit",
													month: "short",
													day: "numeric",
												})
											: "-"}
									</span>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
						<div className="p-4 bg-base-200 border border-base-300 rounded-full shadow-md">
							<Plus size={32} className="text-base-content/50" />
						</div>
						<p className="text-sm text-base-content/60">
							No cron jobs created yet.
						</p>
						<button
							className="btn btn-sm bg-neutral text-neutral-content hover:bg-neutral/90 border-none rounded-md shadow-sm mt-2 transition-all"
							onClick={() => setOpen(true)}
						>
							Create Your First Job
						</button>
					</div>
				)}
			</div>

			{/* Modals */}
			<CreateCronJobModal
				open={open}
				onClose={() => setOpen(false)}
				projectId={projectId}
				onSuccess={fetchData}
			/>

			{editOpen && (
				<EditProjectModal
					project={project}
					onClose={() => setEditOpen(false)}
					onSuccess={fetchData}
				/>
			)}

			{showDeleteModal && (
				<div className="modal modal-open px-4">
					<div className="modal-box bg-base-200/95 backdrop-blur-md border border-base-300/30 shadow-xl rounded-xl p-6">
						<h3 className="font-bold text-lg text-error/80">
							Delete Project
						</h3>
						<p className="py-4 text-sm text-base-content/70">
							Are you sure you want to delete this project? This will also delete all associated cron jobs. This action cannot be undone.
						</p>
						<div className="modal-action">
							<button
								className="btn btn-sm"
								onClick={() => setShowDeleteModal(false)}
								disabled={deletingProject}
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteProject}
								disabled={deletingProject}
								className="btn btn-sm bg-error/20 text-error rounded-md hover:bg-error/90"
							>
								{deletingProject ? "Deleting..." : "Confirm Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
