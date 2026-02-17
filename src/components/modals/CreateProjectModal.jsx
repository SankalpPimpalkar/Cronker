"use client";

import { useState } from "react";
import { supabase } from "@/configs/supabase.client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContextProvider";

export default function CreateProjectDialog() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	async function handleCreate(e) {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.from("projects").insert({
			name,
			description,
			owner: user.id,
		});

		setLoading(false);

		if (!error) {
			setName("");
			setDescription("");
			document.getElementById("create_project_modal").close();
			router.refresh();
		} else {
			console.error(error);
		}
	}

	return (
		<>
			<dialog id="create_project_modal" className="modal">
				<div className="modal-box bg-base-200">
					<h3 className="font-bold text-lg mb-4">
						Create New Project
					</h3>

					<form onSubmit={handleCreate} className="space-y-4">
						<div className="space-y-2">
							<label className="label">
								<span className="label-text text-sm">Project Name</span>
							</label>
							<input
								type="text"
								required
								className="input input-neutral w-full rounded-md"
								placeholder="Enter project name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label className="label">
								<span className="label-text text-sm">Description</span>
							</label>
							<textarea
								required
								className="textarea textarea-bordered w-full rounded-md"
								placeholder="Enter project description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						{/* Actions */}
						<div className="flex justify-end gap-2 mt-4">
							<button
								type="button"
								className="btn btn-sm border border-base-300 btn-ghost rounded-md active:bg-neutral-700"
								onClick={() =>
									document
										.getElementById("create_project_modal")
										?.close()
								}
							>
								Cancel
							</button>

							<button
								type="submit"
								className={`btn btn-sm border border-base-300 bg-neutral-800 rounded-md active:bg-neutral-700`}
								disabled={loading}
							>
								{loading ? "Creating..." : "Create"}
							</button>
						</div>
					</form>
				</div>

				{/* Backdrop */}
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
}
