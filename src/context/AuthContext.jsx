import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin', 'management', 'teacher', 'student'
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await fetchUserData(session.user);
                // If profile missing on restore, we might want to logout or let them stay 'authenticated' but role-less.
                // Given user request "I don't want Profile Not Found page", we'll force logout if profile is missing.
                if (!profile) {
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    // We only fetch again if we don't have data, or strictly on sign in events
                    // But fetchUserData handles 'currentUser' setting, so we need it.
                    const profile = await fetchUserData(session.user);
                    if (!profile && event === 'SIGNED_IN') {
                        // If explicit sign-in and no profile, logout (handled in login func too, but safety net)
                        // But for updates, maybe they were deleted while logged in?
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setUserRole(null);
                setUserData(null);
            }
            // Ensure loading is set to false after checks
            if (event === 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserData = async (user) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            // Ignore PGRST116 (Row not found) for now, but handle it logic-wise
            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                // If profile found, everything is good
                setUserRole(data.role);
                setUserData(data);
                setCurrentUser(user);
                return data;
            } else {
                // Profile missing: Do NOT log them in fully.
                console.warn("User document not found in 'users' table. Role not assigned.");
                // We deliberately do NOT set currentUser here so the app treats them as not logged in
                // unless they are in the process of initial setup (managed elsewhere)
                // However, for pure auth purposes, they ARE authenticated with Supabase.
                // But our app requires a profile.

                // If this is called during session restoration (useEffect), we might want to force logout?
                // For now, let's just return null so 'login' function knows it failed.
                return null;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null; // Return null on error
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            // Wait for profile fetch to confirm they are a valid user of system
            const profile = await fetchUserData(data.user);

            if (!profile) {
                // Profile missing! Sign them out immediately.
                await supabase.auth.signOut();
                throw new Error("Profile not found. Please contact support.");
            }
        }

        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value = {
        currentUser,
        userRole,
        userData,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
