const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
    const serviceAccount = require('./service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (e) {
    admin.initializeApp();
}

// Cloud Function to delete user from both Firestore and Authentication
exports.deleteUser = functions.https.onCall(async (data, context) => {
    // Check if the request is made by an authenticated user
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to delete users.'
        );
    }

    // Check if the user has management or admin role
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    const callerRole = callerDoc.data()?.role;

    if (callerRole !== 'management' && callerRole !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only management or admin can delete users.'
        );
    }

    const { userId } = data;

    if (!userId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'User ID is required.'
        );
    }

    try {
        // Delete from Firestore
        await admin.firestore().collection('users').doc(userId).delete();

        // Try to delete from students collection if exists
        try {
            await admin.firestore().collection('students').doc(userId).delete();
        } catch (e) {
            // Silent fail if not in students collection
        }

        // Delete from Firebase Authentication
        await admin.auth().deleteUser(userId);

        return {
            success: true,
            message: 'User deleted successfully from both Firestore and Authentication'
        };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to delete user: ' + error.message
        );
    }
});

// Cloud Function to update user password
exports.updateUserPassword = functions.https.onCall(async (data, context) => {
    // Check if the request is made by an authenticated user
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to update passwords.'
        );
    }

    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    const callerRole = callerDoc.data()?.role;

    // Allow teachers, management, and admin to update passwords
    if (callerRole !== 'teacher' && callerRole !== 'management' && callerRole !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only teachers, management, or admin can update passwords.'
        );
    }

    const { uid, password } = data;

    if (!uid || !password) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'User ID and new password are required.'
        );
    }

    if (password.length < 6) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Password must be at least 6 characters long.'
        );
    }

    try {
        await admin.auth().updateUser(uid, {
            password: password
        });

        return {
            success: true,
            message: 'Password updated successfully.'
        };
    } catch (error) {
        console.error('Error updating password:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to update password: ' + error.message
        );
    }
});
