"use client";

import { supabase } from "@/configs/supabase.client";

export default function LoginPage() {
	async function handleLogin() {
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: "http://localhost:3000/auth/callback",
			},
		});
	}

	return <button onClick={handleLogin}>Continue with Google</button>;
}
