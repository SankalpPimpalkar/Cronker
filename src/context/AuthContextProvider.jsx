"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/configs/supabase.client";

const AuthContext = createContext({
	user: null,
	loading: true,
});

export function AuthContextProvider({ initialUser, children }) {
	const [user, setUser] = useState(initialUser);
	const [loading, setLoading] = useState(!initialUser);

	useEffect(() => {
		if (!initialUser) {
			supabase.auth.getUser().then(({ data }) => {
				setUser(data.user);
				setLoading(false);
			});
		}

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_, session) => {
				setUser(session?.user ?? null);
			},
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, [initialUser]);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
