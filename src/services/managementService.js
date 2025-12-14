import { supabase } from '../supabase/config';

export const addStaff = async (staffData) => {
    try {
        const { email, password, name, subject } = staffData;

        // 1. Create Authentication User in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'teacher'
                }
            }
        });

        if (authError) throw authError;
        const userId = authData.user.id;

        // 2. Create User Document in users table
        const { error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email,
                name,
                role: 'teacher',
                subject,
                created_at: new Date().toISOString()
            });

        if (userError) throw userError;

        return userId;
    } catch (error) {
        console.error("Error adding staff: ", error);
        throw error;
    }
};

export const getPendingStudents = async (schoolId) => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'pending');

    if (error) throw error;
    return data || [];
};

export const approveStudent = async (studentId) => {
    const { error } = await supabase
        .from('students')
        .update({ status: 'active' })
        .eq('id', studentId);

    if (error) throw error;
};
