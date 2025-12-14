import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Initialize Cloud Functions
const functions = getFunctions();

// --- SHARED / GENERIC ---

// Enhanced deleteUser that calls Cloud Function
export const deleteUser = async (userId) => {
    try {
        // Try to use Cloud Function if available
        try {
            const deleteUserFunction = httpsCallable(functions, 'deleteUser');
            const result = await deleteUserFunction({ userId });
            console.log('Cloud Function result:', result.data);
            return result.data;
        } catch (cloudError) {
            console.warn('Cloud Function not available, falling back to client-side deletion:', cloudError);

            // Fallback: Delete from Firestore only (Auth deletion requires Cloud Function)
            await deleteDoc(doc(db, "users", userId));

            try {
                await deleteDoc(doc(db, "students", userId));
            } catch (e) {
                // Silent fail if not in students collection
            }

            console.warn('⚠️ User deleted from Firestore only. Authentication account still exists. Deploy Cloud Functions for complete deletion.');
            return {
                success: true,
                warning: 'Deleted from Firestore only. Authentication account remains. Deploy Cloud Functions for complete deletion.'
            };
        }
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};

export const updateUser = async (userId, updates) => {
    try {
        await updateDoc(doc(db, "users", userId), {
            ...updates,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        throw error;
    }
};

// --- TEACHER & GRADES ---

export const getEnrolledStudents = async (schoolId, grade) => {
    try {
        const q = query(collection(db, "users"), where("role", "==", "student"));

        const snapshot = await getDocs(q);
        let students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (grade) {
            students = students.filter(s => s.grade === grade);
        }

        return students;
    } catch (error) {
        throw error;
    }
};

// Enhanced grade saving with exam type support
export const saveGrade = async (studentId, studentName, subject, examType, marks, teacherId, teacherName) => {
    console.log('saveGrade function called with:', {
        studentId,
        studentName,
        subject,
        examType,
        marks,
        teacherId,
        teacherName
    });

    try {
        const gradeId = `${studentId}_${subject}_${examType}`;
        console.log('Generated gradeId:', gradeId);

        const gradeData = {
            studentId,
            studentName,
            subject,
            examType,
            marks,
            teacherId,
            teacherName,
            updatedAt: Timestamp.now()
        };

        console.log('Saving to Firestore:', gradeData);
        await setDoc(doc(db, "grades", gradeId), gradeData);
        console.log('Grade saved to Firestore successfully!');
    } catch (error) {
        console.error('Error in saveGrade:', error);
        throw error;
    }
};

export const getStudentGrades = async (studentId) => {
    try {
        const q = query(collection(db, "grades"), where("studentId", "==", studentId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw error;
    }
};

export const deleteGrade = async (gradeId) => {
    try {
        await deleteDoc(doc(db, "grades", gradeId));
    } catch (error) {
        throw error;
    }
};

export const updateGrade = async (gradeId, marks) => {
    try {
        await updateDoc(doc(db, "grades", gradeId), {
            marks,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        throw error;
    }
};

// Get all grades for a specific subject and exam type
export const getGradesBySubjectAndExam = async (subject, examType) => {
    try {
        const q = query(
            collection(db, "grades"),
            where("subject", "==", subject),
            where("examType", "==", examType)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw error;
    }
};

// --- MANAGEMENT ---

export const getStaff = async () => {
    try {
        const q = query(collection(db, "users"), where("role", "==", "teacher"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw error;
    }
}

export const updateUserPassword = async (studentId, newPassword) => {
    try {
        const updatePasswordFn = httpsCallable(functions, 'updateUserPassword');
        const result = await updatePasswordFn({ uid: studentId, password: newPassword });
        return result.data;
    } catch (error) {
        console.error("Error calling updateUserPassword:", error);
        if (error.code === 'functions/not-found' || error.message.includes('internal')) {
            throw new Error("Backend Cloud Function 'updateUserPassword' is not deployed.");
        }
        throw error;
    }
};
