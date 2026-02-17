"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContextProvider";
import { supabase } from "@/configs/supabase.client";
import CreateProjectDialog from "../modals/CreateProjectModal";
import Link from "next/link";

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
							className="card bg-base-200 shadow-md hover:shadow-xl transition border border-base-200 rounded-md"
						>
							<div className="card-body p-5 gap-1">
								<h2 className="card-title">{project.name}</h2>
								<p className="text-base-content/70">
									{project.description}
								</p>

								<div className="card-actions justify-end mt-4">
									<Link href={`/projects/${project.id}`} className="btn btn-sm border border-base-300 bg-neutral-800 rounded-md active:bg-neutral-700">
										Open
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center mt-20 text-center">
					<p className="text-sm text-base-content/60">
						No projects yet.
					</p>
					<button
						className="btn btn-sm border border-base-300 bg-neutral-800 rounded-md active:bg-neutral-700 mt-6"
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
