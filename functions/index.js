/**
 * Firebase Cloud Functions for YouthWell Mental Health Platform
 * Basic functions for BR E.1 requirement
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * HTTP Cloud Function: Get User Growth Trend
 * Provides user growth analytics for admin dashboard
 */
exports.getUserGrowthTrend = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('Getting user growth trend...');
      
      // Get all users from both collections
      const usersSnapshot = await db.collection('users').get();
      const mockUsersSnapshot = await db.collection('mockUsers').get();
      
      const allUsers = [
        ...usersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt || doc.data().registrationDate
        })),
        ...mockUsersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt || doc.data().registrationDate
        }))
      ];
      
      // Calculate growth trends
      const now = new Date();
      const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      const growthTrend = {
        total: allUsers.length,
        last30Days: allUsers.filter(user => {
          const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return userDate >= last30Days;
        }).length,
        last7Days: allUsers.filter(user => {
          const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return userDate >= last7Days;
        }).length,
        growthRate: allUsers.length > 0 ? 
          ((allUsers.filter(user => {
            const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            return userDate >= last30Days;
          }).length / allUsers.length) * 100).toFixed(1) : 0
      };
      
      console.log('User growth trend calculated:', growthTrend);
      res.status(200).json({ success: true, data: growthTrend });
      
    } catch (error) {
      console.error('Error getting user growth trend:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

/**
 * HTTP Cloud Function: Get Forum Post Categories
 * Provides forum post category distribution for admin dashboard
 */
exports.getForumPostCategories = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('Getting forum post categories...');
      
      // Get all posts from both collections
      const postsSnapshot = await db.collection('posts').get();
      const mockPostsSnapshot = await db.collection('mockPosts').get();
      
      const allPosts = [
        ...postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...mockPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];
      
      // Calculate category distribution
      const categoryDistribution = {};
      allPosts.forEach(post => {
        const category = post.category || 'General';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });
      
      // Convert to array format for charts
      const categoryData = Object.entries(categoryDistribution).map(([category, count]) => ({
        category,
        count,
        percentage: allPosts.length > 0 ? ((count / allPosts.length) * 100).toFixed(1) : 0
      }));
      
      const result = {
        totalPosts: allPosts.length,
        categories: categoryData,
        distribution: categoryDistribution
      };
      
      console.log('Forum post categories calculated:', result);
      res.status(200).json({ success: true, data: result });
      
    } catch (error) {
      console.error('Error getting forum post categories:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});