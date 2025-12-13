import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, setDoc } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from '../firebase/config';

export const addStaff = async (staffData) => {
    // Secondary App for creating user without logging out the current user (Management)
    // We use a different name for the app instance to avoid conflict
    const appName = "SecondaryApp-" + new Date().getTime();
    const secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
        const { email, password, name, subject } = staffData;

        // 1. Create Authentication User
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // 2. Create User Document in Firestore
        // We assume 'schoolId' should be linked here. 
        // For now we will add a placeholder or rely on logic that links them later.
        // In a real scenario, we'd pass the current management user's schoolId to this function.
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            name: name,
            role: 'teacher',
            subject: subject,
            createdAt: Timestamp.now(),
            // schoolId: 'TODO_LINK_SCHOOL_ID' 
        });

        // 3. Cleanup
        await signOut(secondaryAuth);

        return user.uid;
    } catch (error) {
        console.error("Error adding staff: ", error);
        throw error;
    }
};

export const getPendingStudents = async (schoolId) => {
    const q = query(collection(db, "students"), where("schoolId", "==", schoolId), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const approveStudent = async (studentId) => {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, {
        status: 'active'
    });
};
