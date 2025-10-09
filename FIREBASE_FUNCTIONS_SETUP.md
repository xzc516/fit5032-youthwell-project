# Firebase Cloud Functions Setup Guide

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Node.js v18+ installed

## Setup Steps

### 1. Initialize Firebase Functions

```bash
# Login to Firebase
firebase login

# Initialize functions in your project
firebase init functions
```

**Select:**
- Use existing project: `fit5032-youthwell-project`
- Language: JavaScript
- ESLint: Yes
- Install dependencies: Yes

### 2. Install Dependencies

```bash
cd functions
npm install @sendgrid/mail
npm install
```

### 3. Set Environment Variables

```bash
# Set SendGrid API key
firebase functions:config:set sendgrid.key="SG.1bc6af9c-b278-4d11-a624-e75ae4773752"

# View configuration
firebase functions:config:get
```

### 4. Create Cloud Functions

Create `functions/index.js` with the following code:

```javascript
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')

admin.initializeApp()

// Set SendGrid API key
sgMail.setApiKey(functions.config().sendgrid.key)

/**
 * Send welcome email when new user is created
 * Triggered automatically on user creation
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const email = user.email
  const displayName = user.displayName || 'User'

  const msg = {
    to: email,
    from: 'noreply@youthwell.com', // TODO: Verify this email in SendGrid
    subject: 'Welcome to YouthWell!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Welcome to YouthWell, ${displayName}!</h1>
        <p>Thank you for joining our mental health support community.</p>
        <p>We're here to support you on your wellbeing journey.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Getting Started:</h3>
          <ul>
            <li>Explore the Mental Health Forum</li>
            <li>Find local support services on our Map</li>
            <li>Connect with peers and professionals</li>
          </ul>
        </div>
        <p><strong>Need immediate help?</strong></p>
        <ul>
          <li>Lifeline: <a href="tel:131114">13 11 14</a></li>
          <li>Kids Helpline: <a href="tel:1800551800">1800 55 1800</a></li>
          <li>Beyond Blue: <a href="tel:1300224636">1300 22 4636</a></li>
        </ul>
        <p>Best regards,<br>The YouthWell Team</p>
      </div>
    `,
    text: `Welcome to YouthWell, ${displayName}! Thank you for joining our mental health support community.`
  }

  try {
    await sgMail.send(msg)
    console.log('Welcome email sent to:', email)
    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
})

/**
 * Send notification when new forum post is created
 * Triggered on new document in 'posts' collection
 */
exports.notifyNewPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postData = snap.data()
    const postTitle = postData.title
    const author = postData.author

    // Get all users who want notifications (example)
    // In real app, you'd filter by user preferences
    const usersSnapshot = await admin.firestore().collection('users').limit(5).get()

    const emailPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data()
      if (userData.email && userData.email !== postData.authorEmail) {
        const msg = {
          to: userData.email,
          from: 'noreply@youthwell.com',
          subject: `New Post in YouthWell Forum: ${postTitle}`,
          html: `
            <h2>New Forum Post</h2>
            <p><strong>${author}</strong> has created a new post:</p>
            <h3>${postTitle}</h3>
            <p>${postData.summary.substring(0, 100)}...</p>
            <p><a href="https://your-app-url.com/forum">View in Forum</a></p>
          `,
          text: `New post by ${author}: ${postTitle}. Visit YouthWell forum to view.`
        }

        try {
          await sgMail.send(msg)
          console.log('Notification sent to:', userData.email)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    })

    await Promise.all(emailPromises)
    return { success: true }
  })

/**
 * Send mental health resources PDF via email
 * Callable function - can be called from client app
 */
exports.sendResourcesEmail = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { userEmail, username, pdfBase64 } = data

  const msg = {
    to: userEmail,
    from: 'noreply@youthwell.com',
    subject: 'YouthWell - Mental Health Resources',
    html: `
      <h2>Hello ${username},</h2>
      <p>Please find attached mental health resources and support information.</p>
      <p>If you need immediate help, please contact:</p>
      <ul>
        <li>Lifeline: 13 11 14</li>
        <li>Kids Helpline: 1800 55 1800</li>
        <li>Beyond Blue: 1300 22 4636</li>
      </ul>
      <p>Take care,<br>YouthWell Team</p>
    `,
    attachments: [
      {
        content: pdfBase64,
        filename: 'mental-health-resources.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  }

  try {
    await sgMail.send(msg)
    return { success: true, message: 'Resources sent successfully' }
  } catch (error) {
    console.error('Error sending resources:', error)
    throw new functions.https.HttpsError('internal', 'Failed to send email')
  }
})

/**
 * Scheduled function to cleanup old data
 * Runs daily at midnight
 */
exports.cleanupOldData = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Australia/Melbourne')
  .onRun(async (context) => {
    const db = admin.firestore()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Delete posts older than 6 months with no ratings
    const oldPostsQuery = db.collection('posts')
      .where('timestamp', '<', sixMonthsAgo)
      .where('ratings', '==', [])

    const oldPosts = await oldPostsQuery.get()

    const deletePromises = oldPosts.docs.map(doc => doc.ref.delete())
    await Promise.all(deletePromises)

    console.log(`Deleted ${oldPosts.size} old posts`)
    return { deleted: oldPosts.size }
  })

/**
 * Update user stats when they create a post
 * Triggered when a post is created
 */
exports.updateUserStats = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postData = snap.data()
    const userId = postData.authorId

    if (!userId) return null

    const userRef = admin.firestore().collection('users').doc(userId)

    try {
      await userRef.update({
        postCount: admin.firestore.FieldValue.increment(1),
        lastPostDate: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log('User stats updated for:', userId)
      return { success: true }
    } catch (error) {
      console.error('Error updating user stats:', error)
      return { success: false }
    }
  })
```

### 5. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:sendWelcomeEmail
```

### 6. Test Functions

#### Test Welcome Email (automatic on user signup)
```javascript
// This triggers automatically when user registers
// No additional code needed
```

#### Test Callable Function from Client
```javascript
// In your Vue app
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()
const sendResources = httpsCallable(functions, 'sendResourcesEmail')

// Call the function
const result = await sendResources({
  userEmail: 'user@example.com',
  username: 'John',
  pdfBase64: 'base64-encoded-pdf-content'
})

console.log(result.data)
```

### 7. Monitor Functions

View logs:
```bash
firebase functions:log
```

Or in Firebase Console:
- Go to Functions section
- Click on function name
- View "Logs" tab

### 8. Set Firestore Security Rules

Update Firestore rules to work with Cloud Functions:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || request.auth.token.admin == true;
      // Allow Cloud Functions to update user stats
      allow update: if request.auth != null;
    }

    // Posts collection
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
        (resource.data.authorId == request.auth.uid ||
         request.auth.token.admin == true);
    }
  }
}
```

## Integration with Vue App

### Call Cloud Function from Vue Component

```vue
<script setup>
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()

async function sendResourcesPDF() {
  try {
    const sendEmail = httpsCallable(functions, 'sendResourcesEmail')
    const result = await sendEmail({
      userEmail: auth.currentUser.email,
      username: auth.currentUser.username,
      pdfBase64: '...' // your PDF content
    })

    if (result.data.success) {
      alert('Resources sent to your email!')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to send email')
  }
}
</script>
```

## Cost Considerations

Firebase Cloud Functions pricing:
- First 2 million invocations per month: FREE
- First 400,000 GB-seconds: FREE
- First 200,000 CPU-seconds: FREE

SendGrid Free Tier:
- 100 emails per day for free

## Troubleshooting

### Common Errors:

1. **"CORS error" when calling function**
   ```javascript
   // Add to functions/index.js
   const cors = require('cors')({origin: true})
   ```

2. **"Permission denied"**
   - Check Firestore security rules
   - Verify user authentication

3. **"SendGrid authentication failed"**
   - Verify API key is set: `firebase functions:config:get`
   - Verify sender email in SendGrid

4. **Function timeout**
   - Increase timeout in function options:
   ```javascript
   exports.myFunction = functions
     .runWith({ timeoutSeconds: 540 })
     .https.onCall(...)
   ```

## Next Steps

1. Deploy functions: `firebase deploy --only functions`
2. Test each function
3. Monitor logs for errors
4. Set up email verification in SendGrid
5. Configure production environment variables

---

**For more information:**
- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
