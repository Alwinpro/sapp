import { supabase } from '../supabase/config';

export const checkSystemInitialized = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error("Error checking system initialization: ", error);
        return false;
    }
};

export const createSystemAdmin = async (email, password, name) => {
    try {
        // 1. Create Authentication User in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'admin'
                }
            }
        });

        if (authError) throw authError;

        // 2. Create User Document in Supabase database
        const { error: dbError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                role: 'admin',
                status: 'active',
                is_system_admin: true,
                created_at: new Date().toISOString()
            });

        if (dbError) throw dbError;

        return authData.user;
    } catch (error) {
        console.error("Error creating system admin: ", error);
        throw error;
    }
};
