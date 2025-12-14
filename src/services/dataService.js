import { supabase } from '../supabase/config';

// --- SHARED / GENERIC ---

export const deleteUser = async (userId) => {
    try {
        // Delete from users table
        const { error: usersError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (usersError) throw usersError;

        // Try to delete from students table if exists
        await supabase
            .from('students')
            .delete()
            .eq('id', userId);

        // Delete from Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
            console.warn('Could not delete from auth (requires service role key):', authError);
        }

        return {
            success: true,
            message: 'User deleted successfully'
        };
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

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        throw error;
    }
};

export const saveGrade = async (studentId, studentName, subject, examType, marks, teacherId, teacherName) => {
    try {
        const gradeId = `${studentId}_${subject}_${examType}`;

        const { error } = await supabase
            .from('grades')
            .upsert({
                id: gradeId,
                student_id: studentId,
                student_name: studentName,
                subject,
                exam_type: examType,
                marks,
                teacher_id: teacherId,
                teacher_name: teacherName,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error in saveGrade:', error);
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
        return data || [];
    } catch (error) {
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
        throw error;
    }
};

export const getGradesBySubjectAndExam = async (subject, examType) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('subject', subject)
            .eq('exam_type', examType);

        if (error) throw error;
        return data || [];
    } catch (error) {
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
        return data || [];
    } catch (error) {
        throw error;
    }
};

// Password update function - now works with Supabase!
export const updateUserPassword = async (studentId, newPassword) => {
    try {
        const { error } = await supabase.auth.admin.updateUserById(
            studentId,
            { password: newPassword }
        );

        if (error) throw error;

        return {
            success: true,
            message: 'Password updated successfully.'
        };
    } catch (error) {
        console.error("Error updating password:", error);
        throw new Error("Failed to update password: " + error.message);
    }
};
