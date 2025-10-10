/**
 * SendGrid Email Service
 *
 * SETUP INSTRUCTIONS:
 * 1. Sign up for SendGrid: https://signup.sendgrid.com/
 * 2. Create an API key: https://app.sendgrid.com/settings/api_keys
 * 3. Add your API key and sender email below
 * 4. For Firebase Cloud Functions, add to functions/index.js
 */

// SendGrid API Key (provided by user)
const SENDGRID_API_KEY = 'SG.1bc6af9c-b278-4d11-a624-e75ae4773752'

// Verified sender email - MUST be verified in SendGrid first
const SENDER_EMAIL = 'zxuu0151@student.monash.edu'

/**
 * Send email with attachment using SendGrid API
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {Object} options.attachment - Attachment object
 * @param {string} options.attachment.content - Base64 encoded file content
 * @param {string} options.attachment.filename - Filename
 * @param {string} options.attachment.type - MIME type
 * @returns {Promise}
 */
export async function sendEmail(options) {
  // Check if API key is configured
  if (SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
    console.warn('SendGrid API key not configured')
    return {
      success: false,
      message: 'Email service not configured. Please add SendGrid API key.'
    }
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
            subject: options.subject
          }
        ],
        from: { email: SENDER_EMAIL },
        content: [
          {
            type: 'text/plain',
            value: options.text || ''
          },
          {
            type: 'text/html',
            value: options.html || options.text || ''
          }
        ],
        attachments: options.attachment ? [
          {
            content: options.attachment.content,
            filename: options.attachment.filename,
            type: options.attachment.type,
            disposition: 'attachment'
          }
        ] : []
      })
    })

    if (response.ok) {
      return { success: true, message: 'Email sent successfully' }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.errors?.[0]?.message || 'Failed to send email')
    }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail, username) {
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to YouthWell!',
    html: `
      <h1>Welcome to YouthWell, ${username}!</h1>
      <p>Thank you for joining our mental health support community.</p>
      <p>We're here to support you on your wellbeing journey.</p>
      <p>Best regards,<br>The YouthWell Team</p>
    `,
    text: `Welcome to YouthWell, ${username}! Thank you for joining our mental health support community.`
  })
}

/**
 * Send mental health resources PDF via email
 */
export async function sendResourcesEmail(userEmail, username, pdfContent) {
  return sendEmail({
    to: userEmail,
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
    text: `Hello ${username}, please find attached mental health resources. For immediate help: Lifeline 13 11 14, Kids Helpline 1800 55 1800`,
    attachment: {
      content: pdfContent,
      filename: 'mental-health-resources.pdf',
      type: 'application/pdf'
    }
  })
}

/**
 * Send forum post notification
 */
export async function sendPostNotification(userEmail, postTitle, postAuthor) {
  return sendEmail({
    to: userEmail,
    subject: `New Post in YouthWell Forum: ${postTitle}`,
    html: `
      <h2>New Forum Post</h2>
      <p><strong>${postAuthor}</strong> has created a new post:</p>
      <h3>${postTitle}</h3>
      <p><a href="https://your-app-url.com/forum">View in Forum</a></p>
    `,
    text: `New post by ${postAuthor}: ${postTitle}. Visit YouthWell forum to view.`
  })
}

/**
 * Send bulk email to multiple recipients
 * Used by admin dashboard for mass communication
 *
 * @param {Object} options - Bulk email options
 * @param {Array<string>} options.to - Array of recipient emails
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (plain text)
 * @returns {Promise}
 */
export async function sendBulkEmail(options) {
  // Check if API key is configured
  if (SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
    throw new Error('SendGrid API key not configured')
  }

  if (!options.to || !Array.isArray(options.to) || options.to.length === 0) {
    throw new Error('Recipients array is required')
  }

  if (!options.subject || !options.message) {
    throw new Error('Subject and message are required')
  }

  try {
    // SendGrid allows sending to multiple recipients in one request
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: options.to.map(email => ({ email })),
            subject: options.subject
          }
        ],
        from: {
          email: SENDER_EMAIL,
          name: 'YouthWell Admin'
        },
        content: [
          {
            type: 'text/plain',
            value: options.message
          },
          {
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
                  <h1 style="margin: 0;">YouthWell</h1>
                  <p style="margin: 5px 0 0 0; opacity: 0.9;">Mental Health Support Platform</p>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                  <div style="background: white; padding: 20px; border-radius: 8px;">
                    ${options.message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                <div style="padding: 20px; text-align: center; background: #e9ecef; color: #6c757d; font-size: 12px;">
                  <p>This email was sent from YouthWell Admin Dashboard</p>
                  <p style="margin: 10px 0 0 0;">
                    For immediate support: Lifeline 13 11 14 | Kids Helpline 1800 55 1800
                  </p>
                </div>
              </div>
            `
          }
        ]
      })
    })

    if (response.ok) {
      return {
        success: true,
        message: `Email sent successfully to ${options.to.length} recipient(s)`
      }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.errors?.[0]?.message || 'Failed to send bulk email')
    }
  } catch (error) {
    console.error('SendGrid bulk email error:', error)
    throw error
  }
}
