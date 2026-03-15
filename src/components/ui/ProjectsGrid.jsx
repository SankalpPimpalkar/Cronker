"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContextProvider";
import { supabase } from "@/configs/supabase.client";
import CreateProjectDialog from "../modals/CreateProjectModal";
import Link from "next/link";
import { Folder, FolderPlus } from "lucide-react";

export default function ProjectsGrid() {
	const [projects, setProjects] = useState([]);
	const { user } = useAuth();

	useEffect(() => {
		(async () => {
			const { data } = await supabase
				.from("projects")
				.select("*")
				.eq("owner", user.id)
				.order("created_at", { ascending: true });

			setProjects(data);
		})();
	}, []);

	return (
		<div>
			{projects.length > 0 ? (
				<div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
					{projects.map((project) => (
						<div
							key={project.id}
							className="group bg-base-200/40 backdrop-blur-sm hover:bg-base-200/80 border border-base-300/40 hover:border-neutral-500/30 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
						>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<div className="p-1.5 bg-base-300/30 rounded-lg group-hover:bg-neutral-800 transition-colors">
										<Folder size={16} className="text-base-content/70 group-hover:text-neutral-content" />
									</div>
									<h2 className="text-lg font-semibold tracking-tight">
										{project.name}
									</h2>
								</div>
								<p className="text-sm text-base-content/70 line-clamp-2">
									{project.description}
								</p>
							</div>

							<div className="flex justify-end mt-5">
								<Link
									href={`/projects/${project.id}`}
									className="btn btn-sm border border-base-300/80 bg-base-100 hover:bg-neutral-800 hover:text-neutral-content rounded-md transition-all font-medium"
								>
									Open
								</Link>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center mt-20 text-center space-y-4">
					<div className="p-4 bg-base-200 border border-base-300 rounded-full shadow-md animate-pulse">
						<FolderPlus size={32} className="text-base-content/50" />
					</div>
					<p className="text-sm text-base-content/60">
						No projects yet.
					</p>
					<button
						className="btn btn-sm bg-neutral text-neutral-content hover:bg-neutral/90 border-none rounded-md shadow-sm mt-4 transition-all"
						onClick={() =>
							document
								.getElementById("create_project_modal")
								.showModal()
						}
					>
						Create Your First Project
					</button>
				</div>
			)}
			<CreateProjectDialog />
		</div>
	);
}
