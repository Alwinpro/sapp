import { supabase } from '../supabase/config';

// --- SHARED / GENERIC ---

export const deleteUser = async (userId) => {
    try {
        // Delete from public.users table (trigger should handle auth.users if set up)
        // Or explicitly call a function if one exists.
        // For now, we delete from the 'users' table.
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) throw userError;

        // Try deleting from 'students' if it exists there
        const { error: studentError } = await supabase
            .from('students')
            .delete()
            .eq('id', userId);

        // Ignore studentError if it's just "row not found" (Supabase doesn't error on 0 rows usually)

        // Note: Deleting the actual Auth user usually requires a Supabase Edge Function or 
        // using the Service Role key, which we shouldn't expose here.
        // We'll return a warning similar to the Firebase implementation.
        console.warn('User deleted from profile table. Complete Auth deletion requires server-side admin privileges.');

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};

export const updateUser = async (userId, updates) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
};

// --- TEACHER & GRADES ---

export const getEnrolledStudents = async (schoolId, grade) => {
    try {
        let query = supabase
            .from('users')
            .select('*')
            .eq('role', 'student');

        if (grade) {
            query = query.eq('grade', grade);
        }

        // If schoolId logic exists in DB, add .eq('schoolId', schoolId)

        const { data, error } = await query;

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get students error:', error);
        throw error;
    }
};

export const saveGrade = async (studentId, studentName, subject, examType, marks, teacherId, teacherName) => {
    try {
        // Composite key simulation or just use a unique ID. 
        // Supabase allows upsert if we have a primary key constraint.
        // We'll generate a custom ID like in the Firebase code.
        const gradeId = `${studentId}_${subject}_${examType}`;

        const gradeData = {
            id: gradeId, // Assuming 'id' is the primary key column
            student_id: studentId,
            student_name: studentName,
            subject,
            exam_type: examType,
            marks,
            teacher_id: teacherId,
            teacher_name: teacherName,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('grades')
            .upsert(gradeData);

        if (error) throw error;
    } catch (error) {
        console.error('Save grade error:', error);
        throw error;
    }
};

export const getStudentGrades = async (studentId) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', studentId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get grades error:', error);
        throw error;
    }
};

export const deleteGrade = async (gradeId) => {
    try {
        const { error } = await supabase
            .from('grades')
            .delete()
            .eq('id', gradeId);

        if (error) throw error;
    } catch (error) {
        console.error('Delete grade error:', error);
        throw error;
    }
};

export const updateGrade = async (gradeId, marks) => {
    try {
        const { error } = await supabase
            .from('grades')
            .update({
                marks,
                updated_at: new Date().toISOString()
            })
            .eq('id', gradeId);

        if (error) throw error;
    } catch (error) {
        console.error('Update grade error:', error);
        throw error;
    }
};

export const getGradesBySubjectAndExam = async (subject, examType) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('subject', subject)
            .eq('exam_type', examType); // Note: check if column is camelCase or snake_case in your DB

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get grades by subject error:', error);
        throw error;
    }
};

// --- MANAGEMENT ---

export const getStaff = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'teacher');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get staff error:', error);
        throw error;
    }
};
