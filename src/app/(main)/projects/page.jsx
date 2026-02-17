"use client";

import React from "react";
import { useAuth } from "@/context/AuthContextProvider";
import ProjectsGrid from "@/components/ui/ProjectsGrid";
import CreateProjectDialog from "@/components/modals/CreateProjectModal";

export default function DashboardPage() {
	const { user } = useAuth();

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-base-content/70 mt-1 text-sm">
						Welcome back,{" "}
						<span className="font-semibold">
							{user?.user_metadata?.full_name || user?.email}
						</span>
					</p>
				</div>

				<button
					className="btn btn-sm border border-base-300 bg-neutral-800 rounded-md active:bg-neutral-700"
					onClick={() =>
						document
							.getElementById("create_project_modal")
							.showModal()
					}
				>
					Create Project
				</button>
			</div>

			<ProjectsGrid />
			<CreateProjectDialog />
		</div>
	);
}
