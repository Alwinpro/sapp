import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, setDoc } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from '../firebase/config';

export const addStudent = async (studentData) => {
    // Secondary App for creating user without logging out the current user (Teacher)
    const appName = "SecondaryApp-Student-" + new Date().getTime();
    const secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
        const { email, password, name, rollNumber, grade } = studentData;

        // 1. Create Authentication User
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // 2. Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            name: name,
            role: 'student',
            rollNumber: rollNumber,
            grade: grade || 'N/A', // Assuming grade is passed or defaulted
            status: 'active', // Or 'pending' if Management needs to approve. Prompt says "Approve Student Enrollment (added by teachers)", so status should probably be pending.
            createdAt: Timestamp.now(),
        });

        // 3. Create Student Table Entry if separate (Optional based on schema design, but likely useful for queries)
        // For simplicity, we query 'users' where role is 'student', but if we have a separate 'students' collection as implied by 'approveStudent' logic in previous turns:

        await setDoc(doc(db, "students", user.uid), {
            uid: user.uid, // Link to User
            name: name,
            email: email,
            rollNumber: rollNumber,
            grade: grade || 'N/A',
            status: 'pending', // Per Management Dashboard requirement "Approve Student Enrollment"
            schoolId: 'TODO_LINK_SCHOOL_ID', // In real app
            createdAt: Timestamp.now()
        });


        // 4. Cleanup
        await signOut(secondaryAuth);

        return user.uid;
    } catch (error) {
        console.error("Error adding student: ", error);
        throw error;
    }
};
