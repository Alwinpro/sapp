import { supabase } from '../supabase/config';

export const createSchool = async (schoolData, managementPassword) => {
    try {
        // 1. Create School
        const { data: school, error: schoolError } = await supabase
            .from('schools')
            .insert([{
                name: schoolData.name,
                address: schoolData.address,
                contact: schoolData.contact,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (schoolError) throw schoolError;
        const schoolId = school.id;

        // 2. Create Management User (Auth)
        // WARNING: Client-side signUp will sign in as the new user!
        // To avoid this, we would need a backend function. 
        // For now, we proceed as-is, assuming this is an initial setup or accepting the session switch.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: schoolData.principalEmail,
            password: managementPassword,
        });

        if (authError) throw authError;
        const user = authData.user;

        if (user) {
            // 3. Create User Profile
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: user.id, // Link to Auth ID
                    email: schoolData.principalEmail,
                    role: 'management',
                    school_id: schoolId,
                    name: `Principal - ${schoolData.name}`,
                    created_at: new Date().toISOString()
                }]);

            if (profileError) throw profileError;
        }

        return schoolId;
    } catch (error) {
        console.error("Error creating school and user: ", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error getting users: ", error);
        throw error;
    }
};
