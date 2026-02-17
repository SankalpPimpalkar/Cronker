"use client";

import { useAuth } from "@/context/AuthContextProvider";
import { supabase } from "@/configs/supabase.client";
import { useRouter } from "next/navigation";

export default function Navbar() {
	const { user } = useAuth();
	const router = useRouter();

	async function handleLogout() {
		await supabase.auth.signOut();
		router.push("/login");
		router.refresh();
	}

	return (
		<div className="w-full border-b border-base-300">
			<div className="w-full max-w-5xl mx-auto flex items-center justify-between bg-base-100 shadow-sm p-4">
				<div className="flex-1">
					<span className="text-2xl font-bold tracking-wide">
						Cronker
					</span>
				</div>

				<div className="flex-none">
					{user && (
						<div className="dropdown dropdown-end">
							<div
								tabIndex={0}
								role="button"
								className="btn btn-ghost btn-circle avatar"
							>
								<div className="w-10 rounded-full overflow-hidden">
									<img
										src={user.user_metadata?.picture}
										alt={user.user_metadata?.name}
									/>
								</div>
							</div>

							<ul
								tabIndex={0}
								className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow"
							>
								<li className="px-2 py-1 text-sm opacity-70">
									{user.email}
								</li>

								<li>
									<button onClick={handleLogout}>
										Logout
									</button>
								</li>
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
