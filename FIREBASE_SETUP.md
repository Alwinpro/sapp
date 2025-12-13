# School Management System - Firebase Setup

## Firebase Cloud Functions Setup

To enable complete user deletion (including Firebase Authentication), you need to deploy Cloud Functions.

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project with Blaze plan (pay-as-you-go) - Cloud Functions require this

### Setup Steps

#### 1. Initialize Firebase (if not already done)
```bash
firebase login
firebase init
```

Select:
- ✅ Functions
- Choose your existing project
- Language: JavaScript
- ESLint: Yes (optional)
- Install dependencies: Yes

#### 2. Install Dependencies
```bash
cd functions
npm install
```

#### 3. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### How It Works

**With Cloud Functions (Recommended):**
- ✅ Deletes user from Firestore
- ✅ Deletes user from Firebase Authentication
- ✅ Secure (role-based access control)
- ✅ Complete cleanup

**Without Cloud Functions (Current Fallback):**
- ✅ Deletes user from Firestore
- ❌ User remains in Firebase Authentication
- ⚠️ Warning message shown to user

### Testing

After deploying, the delete function will automatically:
1. Try to call the Cloud Function
2. If successful: Delete from both Firestore and Auth
3. If Cloud Function not available: Delete from Firestore only with warning

### Security Rules

The Cloud Function checks:
- User must be authenticated
- User must have 'management' or 'admin' role
- Only then can they delete other users

### Cost

Cloud Functions on Blaze plan:
- First 2 million invocations/month: FREE
- After that: $0.40 per million invocations
- For a school system: Essentially FREE

### Alternative: Manual Cleanup

If you don't want to use Cloud Functions, you can manually delete users from Firebase Console:
1. Go to Firebase Console → Authentication
2. Find the user by email/UID
3. Click the 3 dots → Delete account

## Current Status

✅ Cloud Function code created: `functions/index.js`
✅ Client-side code updated with fallback
⏳ Waiting for deployment

Run `firebase deploy --only functions` to enable complete deletion!
