import { db, auth } from '../firebase/config';
import { collection, getDocs, query, where, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const checkSystemInitialized = async () => {
    try {
        const q = query(collection(db, "users"), where("role", "==", "admin"));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error("Error checking system initialization: ", error);
        return false; // Assume not initialized if error (or handle differently)
    }
};

export const createSystemAdmin = async (email, password, name) => {
    try {
        // 1. Create Authentication User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            name: name,
            role: 'admin',
            createdAt: Timestamp.now(),
            isSystemAdmin: true
        });

        return user;
    } catch (error) {
        console.error("Error creating system admin: ", error);
        throw error;
    }
};
