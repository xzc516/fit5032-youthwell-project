/**
 * Firebase Cloud Functions for YouthWell Mental Health Platform
 * Implements server-side functionality for BR E.1 requirement
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const express = require('express');
const nodemailer = require('nodemailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Express app for HTTP functions
const app = express();
app.use(express.json());

/**
 * HTTP Cloud Function: Get User Statistics
 * Provides comprehensive user analytics for admin dashboard
 */
exports.getUserStats = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('Getting user statistics...');
      
      // Get all users
      const usersSnapshot = await db.collection('users').get();
      const mockUsersSnapshot = await db.collection('mockUsers').get();
      
      const allUsers = [
        ...usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...mockUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];
      
      // Get all posts
      const postsSnapshot = await db.collection('posts').get();
      const mockPostsSnapshot = await db.collection('mockPosts').get();
      
      const allPosts = [
        ...postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...mockPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];
      
      // Get all assessments
      const assessmentsSnapshot = await db.collection('assessmentResults').get();
      const mockAssessmentsSnapshot = await db.collection('mockAssessments').get();
      
      const allAssessments = [
        ...assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...mockAssessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];
      
      // Calculate statistics
      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(user => user.status === 'active' || !user.status).length,
        adminUsers: allUsers.filter(user => user.role === 'admin').length,
        totalPosts: allPosts.length,
        totalAssessments: allAssessments.length,
        averageRating: allPosts.length > 0 ? 
          (allPosts.reduce((sum, post) => sum + (post.avgRating || 0), 0) / allPosts.length).toFixed(1) : 0,
        completionRate: allAssessments.length > 0 ? 
          ((allAssessments.filter(a => a.isCompleted).length / allAssessments.length) * 100).toFixed(1) : 0,
        userGrowth: calculateUserGrowth(allUsers),
        categoryDistribution: calculateCategoryDistribution(allPosts),
        riskLevelDistribution: calculateRiskDistribution(allAssessments),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
      
      console.log('User statistics calculated:', stats);
      res.status(200).json({ success: true, data: stats });
      
    } catch (error) {
      console.error('Error getting user statistics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

/**
 * HTTP Cloud Function: Send Bulk Email
 * Handles server-side email sending with SendGrid integration
 */
exports.sendBulkEmail = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { recipients, subject, message, template } = req.body;
      
      if (!recipients || !subject || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: recipients, subject, message' 
        });
      }
      
      console.log('Sending bulk email to:', recipients.length, 'recipients');
      
      // Get recipient emails based on type
      let emailList = [];
      
      if (recipients === 'all') {
        const usersSnapshot = await db.collection('users').get();
        const mockUsersSnapshot = await db.collection('mockUsers').get();
        emailList = [
          ...usersSnapshot.docs.map(doc => doc.data().email).filter(Boolean),
          ...mockUsersSnapshot.docs.map(doc => doc.data().email).filter(Boolean)
        ];
      } else if (recipients === 'admins') {
        const usersSnapshot = await db.collection('users').get();
        const mockUsersSnapshot = await db.collection('mockUsers').get();
        emailList = [
          ...usersSnapshot.docs.filter(doc => doc.data().role === 'admin').map(doc => doc.data().email),
          ...mockUsersSnapshot.docs.filter(doc => doc.data().role === 'admin').map(doc => doc.data().email)
        ].filter(Boolean);
      }
      
      // Configure email transporter (using SendGrid)
      const transporter = nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: functions.config().sendgrid?.key || process.env.SENDGRID_API_KEY
        }
      });
      
      // Send emails
      const emailPromises = emailList.map(email => {
        const mailOptions = {
          from: functions.config().email?.from || 'noreply@youthwell.com',
          to: email,
          subject: subject,
          html: generateEmailHTML(message, template),
          text: message
        };
        
        return transporter.sendMail(mailOptions);
      });
      
      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Bulk email sent: ${successful} successful, ${failed} failed`);
      
      res.status(200).json({ 
        success: true, 
        message: `Email sent to ${successful} recipients`,
        details: { successful, failed, total: emailList.length }
      });
      
    } catch (error) {
      console.error('Error sending bulk email:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

/**
 * HTTP Cloud Function: Export Data to CSV
 * Generates and returns CSV data for various collections
 */
exports.exportData = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { dataType } = req.query;
      
      if (!dataType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing dataType parameter' 
        });
      }
      
      console.log('Exporting data type:', dataType);
      
      let csvData = [];
      let filename = '';
      
      switch (dataType) {
        case 'users':
          const usersSnapshot = await db.collection('mockUsers').get();
          csvData = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              username: data.username,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              status: data.status,
              age: data.age,
              location: data.location,
              registrationDate: data.registrationDate ? 
                moment(data.registrationDate.toDate()).format('YYYY-MM-DD') : '',
              lastLogin: data.lastLogin ? 
                moment(data.lastLogin.toDate()).format('YYYY-MM-DD HH:mm:ss') : ''
            };
          });
          filename = 'youthwell-users.csv';
          break;
          
        case 'posts':
          const postsSnapshot = await db.collection('mockPosts').get();
          csvData = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              author: data.author,
              category: data.category,
              avgRating: data.avgRating,
              ratingCount: data.ratingCount,
              views: data.views,
              replies: data.replies,
              status: data.status,
              createdAt: data.createdAt ? 
                moment(data.createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss') : ''
            };
          });
          filename = 'youthwell-posts.csv';
          break;
          
        case 'assessments':
          const assessmentsSnapshot = await db.collection('mockAssessments').get();
          csvData = assessmentsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              assessmentType: data.assessmentType,
              totalScore: data.totalScore,
              severity: data.severity,
              riskLevel: data.riskLevel,
              duration: data.duration,
              followUpRequired: data.followUpRequired,
              completedDate: data.completedDate ? 
                moment(data.completedDate.toDate()).format('YYYY-MM-DD HH:mm:ss') : ''
            };
          });
          filename = 'youthwell-assessments.csv';
          break;
          
        case 'appointments':
          const appointmentsSnapshot = await db.collection('mockAppointments').get();
          csvData = appointmentsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              clientName: data.clientName,
              appointmentType: data.appointmentType,
              counselor: data.counselor,
              scheduledDate: data.scheduledDate ? 
                moment(data.scheduledDate.toDate()).format('YYYY-MM-DD HH:mm:ss') : '',
              duration: data.duration,
              status: data.status,
              location: data.location,
              isOnline: data.isOnline
            };
          });
          filename = 'youthwell-appointments.csv';
          break;
          
        default:
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid dataType. Supported: users, posts, assessments, appointments' 
          });
      }
      
      // Generate CSV content
      const csvContent = generateCSVContent(csvData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

/**
 * HTTP Cloud Function: Process Assessment Results
 * Analyzes assessment data and provides insights
 */
exports.processAssessmentResults = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing userId parameter' 
        });
      }
      
      console.log('Processing assessment results for user:', userId);
      
      // Get user's assessments
      const assessmentsSnapshot = await db.collection('mockAssessments')
        .where('userId', '==', userId)
        .orderBy('completedDate', 'desc')
        .get();
      
      const assessments = assessmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (assessments.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'No assessments found for this user' 
        });
      }
      
      // Analyze results
      const analysis = {
        totalAssessments: assessments.length,
        averageScore: assessments.reduce((sum, a) => sum + a.totalScore, 0) / assessments.length,
        severityTrend: analyzeSeverityTrend(assessments),
        riskLevel: calculateOverallRisk(assessments),
        recommendations: generateRecommendations(assessments),
        lastAssessment: assessments[0],
        progressTrend: calculateProgressTrend(assessments)
      };
      
      console.log('Assessment analysis completed:', analysis);
      res.status(200).json({ success: true, data: analysis });
      
    } catch (error) {
      console.error('Error processing assessment results:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// Helper functions
function calculateUserGrowth(users) {
  const now = new Date();
  const last30Days = users.filter(user => {
    const regDate = user.registrationDate?.toDate ? user.registrationDate.toDate() : new Date(user.registrationDate);
    return (now - regDate) <= (30 * 24 * 60 * 60 * 1000);
  }).length;
  
  const last7Days = users.filter(user => {
    const regDate = user.registrationDate?.toDate ? user.registrationDate.toDate() : new Date(user.registrationDate);
    return (now - regDate) <= (7 * 24 * 60 * 60 * 1000);
  }).length;
  
  return {
    total: users.length,
    last30Days,
    last7Days,
    growthRate: users.length > 0 ? ((last30Days / users.length) * 100).toFixed(1) : 0
  };
}

function calculateCategoryDistribution(posts) {
  const categories = {};
  posts.forEach(post => {
    const category = post.category || 'General';
    categories[category] = (categories[category] || 0) + 1;
  });
  return categories;
}

function calculateRiskDistribution(assessments) {
  const risks = { Low: 0, Medium: 0, High: 0 };
  assessments.forEach(assessment => {
    const risk = assessment.riskLevel || 'Low';
    risks[risk] = (risks[risk] || 0) + 1;
  });
  return risks;
}

function generateEmailHTML(message, template) {
  const baseHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
        <h1 style="margin: 0;">YouthWell</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Mental Health Support Platform</p>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <div style="background: white; padding: 20px; border-radius: 8px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      <div style="padding: 20px; text-align: center; background: #e9ecef; color: #6c757d; font-size: 12px;">
        <p>This email was sent from YouthWell Admin Dashboard</p>
        <p style="margin: 10px 0 0 0;">
          For immediate support: Lifeline 13 11 14 | Kids Helpline 1800 55 1800
        </p>
      </div>
    </div>
  `;
  
  return baseHTML;
}

function generateCSVContent(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

function analyzeSeverityTrend(assessments) {
  if (assessments.length < 2) return 'Insufficient data';
  
  const recent = assessments.slice(0, 3);
  const older = assessments.slice(3, 6);
  
  const recentAvg = recent.reduce((sum, a) => sum + a.totalScore, 0) / recent.length;
  const olderAvg = older.length > 0 ? 
    older.reduce((sum, a) => sum + a.totalScore, 0) / older.length : recentAvg;
  
  if (recentAvg < olderAvg) return 'Improving';
  if (recentAvg > olderAvg) return 'Declining';
  return 'Stable';
}

function calculateOverallRisk(assessments) {
  const highRiskCount = assessments.filter(a => a.riskLevel === 'High').length;
  const mediumRiskCount = assessments.filter(a => a.riskLevel === 'Medium').length;
  
  if (highRiskCount > 0) return 'High';
  if (mediumRiskCount > assessments.length * 0.5) return 'Medium';
  return 'Low';
}

function generateRecommendations(assessments) {
  const recommendations = [];
  const highRiskCount = assessments.filter(a => a.riskLevel === 'High').length;
  
  if (highRiskCount > 0) {
    recommendations.push('Consider immediate professional intervention');
  }
  
  if (assessments.length > 3) {
    recommendations.push('Regular follow-up assessments recommended');
  }
  
  recommendations.push('Maintain consistent self-care practices');
  recommendations.push('Consider joining support groups');
  
  return recommendations;
}

function calculateProgressTrend(assessments) {
  if (assessments.length < 2) return 'Insufficient data';
  
  const scores = assessments.map(a => a.totalScore);
  const trend = scores[0] - scores[scores.length - 1];
  
  if (trend < -2) return 'Improving';
  if (trend > 2) return 'Declining';
  return 'Stable';
}
