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

    const ensureUserProfileExists = async (user) => {
        try {
            // Check if ANY users exist (to decide if this should be the first admin)
            const { count, error: countError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            // Determine role: If table is empty, first user is Admin. Otherwise, default to student (or handle appropriately)
            // But if the user is trying to be admin, they might be blocked.
            // Safe fallback: Make them 'student' unless it's the very first user?
            // Actually, if we are in this state, the user is likely the admin who got deleted.
            // Let's check if there is an operational admin.
            const { data: existingAdmin } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'admin')
                .limit(1);

            const role = (!existingAdmin || existingAdmin.length === 0) ? 'admin' : 'student';

            // Insert the missing profile
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || ' recovered_user',
                    role: role,
                    status: 'active',
                    created_at: new Date().toISOString()
                });

            if (insertError) throw insertError;

            return true; // Successfully restored
        } catch (err) {
            console.error("Auto-fix profile failed:", err);
            return false;
        }
    };

    const fetchUserData = async (user) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                // Handle specific database errors
                if (error.code === '42P01') {
                    throw new Error("Critical Error: The database tables have not been created. Please run the setup SQL script in Supabase.");
                }
                if (error.code === '42501') {
                    throw new Error("Permission Denied: RLS policies are blocking access. Please run the RLS setup script.");
                }
                // Ignore PGRST116 (Row not found) as we attempts auto-fix next
                if (error.code !== 'PGRST116') {
                    throw error;
                }
            }

            if (data) {
                setUserRole(data.role);
                setUserData(data);
                setCurrentUser(user);
                return data;
            } else {
                // Profile missing. Attempt to self-heal.
                console.warn("Profile missing. Attempting to auto-create...");
                const restored = await ensureUserProfileExists(user);

                if (restored) {
                    // Retry fetch
                    const { data: newData, error: retryError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (retryError) throw retryError;

                    if (newData) {
                        setUserRole(newData.role);
                        setUserData(newData);
                        setCurrentUser(user);
                        return newData;
                    }
                }
                // If we get here, auto-fix failed or returned no data without throwing
                return null;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Propagate the specific error message to the login function
            throw error;
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
                throw new Error("Login successful, but your user profile could not be found. This may be due to missing Row Level Security (RLS) policies in your Supabase database.");
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
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 animate-pulse">Loading Application...</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
