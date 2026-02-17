"use client";

import { supabase } from "@/configs/supabase.client";

export default function LoginPage() {
	async function handleLogin() {
		const redirectTo = `${window.location.origin}/auth/callback`;

		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo },
		});
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-100 px-6">
			<div className="w-full max-w-md text-center space-y-8">
				{/* Brand */}
				<div className="space-y-3">
					<h1 className="text-4xl font-bold tracking-tight">
						Cronker
					</h1>

					<p className="text-base-content/60 text-sm leading-relaxed">
						A modern cron job management platform for scheduling,
						monitoring, and tracking HTTP executions with real-time
						logs.
					</p>
				</div>

				{/* Google Button */}
				<button
					onClick={handleLogin}
					className="w-full flex items-center justify-center gap-3 bg-white text-black border border-gray-300 rounded-md px-4 py-3 text-sm font-medium hover:shadow-md transition"
				>
					{/* Google Logo */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						className="w-5 h-5"
					>
						<path
							fill="#EA4335"
							d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.91 2.38 30.38 0 24 0 14.64 0 6.44 5.48 2.56 13.44l7.98 6.19C12.36 13.06 17.74 9.5 24 9.5z"
						/>
						<path
							fill="#4285F4"
							d="M46.5 24c0-1.57-.14-3.09-.4-4.55H24v9.09h12.64c-.55 2.95-2.18 5.45-4.64 7.14l7.28 5.66C43.99 37.29 46.5 31.2 46.5 24z"
						/>
						<path
							fill="#FBBC05"
							d="M10.54 28.63A14.49 14.49 0 019.5 24c0-1.62.28-3.18.78-4.63l-7.98-6.19A23.97 23.97 0 000 24c0 3.89.93 7.56 2.56 10.82l7.98-6.19z"
						/>
						<path
							fill="#34A853"
							d="M24 48c6.48 0 11.91-2.13 15.88-5.79l-7.28-5.66c-2.02 1.36-4.61 2.17-8.6 2.17-6.26 0-11.64-3.56-13.46-8.13l-7.98 6.19C6.44 42.52 14.64 48 24 48z"
						/>
					</svg>
					Continue with Google
				</button>

				<p className="text-xs text-base-content/40">
					Secure authentication powered by Google OAuth
				</p>
			</div>
		</div>
	);
}
