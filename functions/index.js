const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

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
