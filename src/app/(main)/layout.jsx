import Navbar from "@/components/ui/Navbar";
import { AuthContextProvider } from "@/context/AuthContextProvider";
import { createClient } from "@/configs/supabase.server";

export default async function MainLayout({ children }) {

	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	return (
		<AuthContextProvider initialUser={user}>
			<div className="w-full">
				<Navbar />
				<main className="w-full max-w-5xl mx-auto px-4 pt-5">{children}</main>
			</div>
		</AuthContextProvider>
	);
}
