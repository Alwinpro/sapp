import { supabase } from '../supabase/config';

export const addStudent = async (studentData) => {
    try {
        const { email, password, name, rollNumber, grade } = studentData;

        // 1. Create Authentication User in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'student'
                }
            }
        });

        if (authError) throw authError;
        const userId = authData.user.id;

        // 2. Create User Record in users table
        const { error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email,
                name,
                role: 'student',
                roll_number: rollNumber,
                grade: grade || 'N/A',
                status: 'active',
                created_at: new Date().toISOString()
            });

        if (userError) throw userError;

        // 3. Create Student Table Entry
        const { error: studentError } = await supabase
            .from('students')
            .insert({
                id: userId,
                name,
                email,
                roll_number: rollNumber,
                grade: grade || 'N/A',
                status: 'pending',
                created_at: new Date().toISOString()
            });

        if (studentError) throw studentError;

        return userId;
    } catch (error) {
        console.error("Error adding student: ", error);
        throw error;
    }
};
