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

/**
 * HTTP Cloud Function: Mental Health Crisis Detection
 * Detects potential mental health crises and provides immediate support
 */
exports.detectMentalHealthCrisis = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { userId, assessmentScore, userBehavior, chatHistory } = req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing userId parameter' 
        });
      }
      
      console.log('Running mental health crisis detection for user:', userId);
      
      // Crisis detection algorithm
      const crisisIndicators = {
        highRiskScore: assessmentScore > 20,
        suicidalKeywords: detectSuicidalKeywords(chatHistory),
        selfHarmIndicators: userBehavior?.selfHarmRisk === 'high',
        socialIsolation: userBehavior?.socialEngagement < 0.3,
        sleepDisruption: userBehavior?.sleepQuality < 0.4,
        substanceUse: userBehavior?.substanceUse === 'increased'
      };
      
      const crisisLevel = calculateCrisisLevel(crisisIndicators);
      
      const crisisResponse = {
        userId: userId,
        crisisLevel: crisisLevel,
        indicators: crisisIndicators,
        urgency: crisisLevel === 'critical' ? 'immediate' : 'monitor',
        recommendedActions: generateCrisisActions(crisisLevel),
        emergencyContacts: {
          lifeline: '13 11 14',
          kidsHelpline: '1800 55 1800',
          beyondBlue: '1300 22 4636',
          emergency: '000'
        },
        followUpRequired: crisisLevel !== 'low',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      
      console.log('Mental health crisis detection completed:', crisisResponse);
      res.status(200).json({ success: true, data: crisisResponse });
      
    } catch (error) {
      console.error('Error in mental health crisis detection:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// Helper functions for crisis detection
function detectSuicidalKeywords(chatHistory) {
  if (!chatHistory) return false;
  
  const suicidalKeywords = [
    'suicide', 'kill myself', 'end it all', 'not worth living',
    'better off dead', 'want to die', 'self harm', 'hurt myself'
  ];
  
  const text = chatHistory.toLowerCase();
  return suicidalKeywords.some(keyword => text.includes(keyword));
}

function calculateCrisisLevel(indicators) {
  const criticalCount = Object.values(indicators).filter(Boolean).length;
  
  if (criticalCount >= 3 || indicators.suicidalKeywords) return 'critical';
  if (criticalCount >= 2) return 'high';
  if (criticalCount >= 1) return 'medium';
  return 'low';
}

function generateCrisisActions(crisisLevel) {
  switch (crisisLevel) {
    case 'critical':
      return [
        'Immediate professional intervention required',
        'Contact emergency services if immediate danger',
        'Stay with the person until help arrives',
        'Remove any means of self-harm'
      ];
    case 'high':
      return [
        'Schedule immediate counseling session',
        'Increase monitoring and check-ins',
        'Provide crisis hotline numbers',
        'Consider hospitalization if necessary'
      ];
    case 'medium':
      return [
        'Schedule counseling within 24-48 hours',
        'Regular check-ins with mental health professional',
        'Provide self-care resources',
        'Monitor for escalation'
      ];
    default:
      return [
        'Continue regular mental health monitoring',
        'Maintain current treatment plan',
        'Regular follow-up assessments'
      ];
  }
}