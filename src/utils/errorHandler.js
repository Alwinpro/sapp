export const handleFirebaseError = (error) => {
    console.error("Full Error:", error);
    const code = error.code;
    const message = error.message;

    if (code === 'auth/email-already-in-use') return 'This email address is already registered.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/weak-password') return 'Password is too weak. Please use at least 6 characters.';
    if (code === 'auth/user-not-found') return 'No account found with this email.';
    if (code === 'auth/wrong-password') return 'Incorrect password. Please try again.';
    if (code === 'permission-denied') return 'You do not have permission to perform this action.';

    // Fallback for custom errors or unhandled codes
    return message.replace('Firebase: ', '');
};
