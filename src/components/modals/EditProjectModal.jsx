"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase.client";
import { useRouter } from "next/navigation";

export default function EditProjectModal({ onClose, project, onSuccess }) {
	const [name, setName] = useState(project?.name || "");
	const [description, setDescription] = useState(project?.description || "");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	async function handleUpdate(e) {
		e.preventDefault();
		if (!project?.id) return;
		
		setLoading(true);

		const { error } = await supabase
			.from("projects")
			.update({
				name,
				description,
			})
			.eq("id", project.id);

		setLoading(false);

		if (!error) {
			if (onSuccess) onSuccess();
			if (onClose) onClose();
			router.refresh();
		} else {
			console.error(error);
		}
	}

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="modal-box bg-base-200/95 backdrop-blur-md border border-base-300/30 shadow-xl rounded-xl p-6 w-full max-w-md space-y-4 z-10">
					<h3 className="font-bold text-lg mb-4 tracking-tight">
						Edit Project
					</h3>

					<form onSubmit={handleUpdate} className="space-y-4">
						<div className="space-y-1.5">
							<label className="label py-0">
								<span className="label-text text-xs text-base-content/60">Project Name</span>
							</label>
							<input
								type="text"
								required
								className="input input-sm h-9 bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm"
								placeholder="Enter project name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className="space-y-1.5">
							<label className="label py-0">
								<span className="label-text text-xs text-base-content/60">Description</span>
							</label>
							<textarea
								required
								className="textarea textarea-bordered bg-base-100/50 border border-base-300/60 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-full rounded-md transition-all text-sm min-h-[80px]"
								placeholder="Enter project description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						{/* Actions */}
						<div className="flex justify-end gap-2 mt-6">
							<button
								type="button"
								className="btn btn-sm border border-base-300 btn-ghost rounded-md font-medium text-xs"
								onClick={onClose}
							>
								Cancel
							</button>

							<button
								type="submit"
								className={`btn btn-sm bg-neutral text-neutral-content hover:bg-neutral/90 border-none rounded-md shadow-sm transition-all font-medium text-xs`}
								disabled={loading}
							>
								{loading ? "Updating..." : "Update"}
							</button>
						</div>
					</form>
			</div>
			{/* Backdrop */}
			<div className="absolute inset-0" onClick={onClose} />
		</div>
	);
}
