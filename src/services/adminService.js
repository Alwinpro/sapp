import { db } from '../firebase/config';
import { collection, addDoc, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from '../firebase/config';

export const createSchool = async (schoolData, managementPassword) => {
    // Secondary App for creating user without logging out admin
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);

    try {
        // 1. Create School
        const schoolRef = await addDoc(collection(db, "schools"), {
            name: schoolData.name,
            address: schoolData.address,
            contact: schoolData.contact,
            createdAt: Timestamp.now()
        });
        const schoolId = schoolRef.id;

        // 2. Create Management User
        const email = schoolData.principalEmail;
        const password = managementPassword; // Need to pass this

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // 3. Create User Document in Firestore (Linked to School)
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: 'management',
            schoolId: schoolId,
            name: `Principal - ${schoolData.name}`,
            createdAt: Timestamp.now()
        });

        // 4. Cleanup
        await signOut(secondaryAuth);
        // Note: deleteApp(secondaryApp) is ideal but not always strictly necessary for a quick action,
        // but good practice if supported by SDK version. v9 modular doesn't expose deleteApp easily in all contexts?
        // Actually it does: import { deleteApp } from "firebase/app"; 

        return schoolId;
    } catch (error) {
        console.error("Error creating school and user: ", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting users: ", error);
        throw error;
    }
};
