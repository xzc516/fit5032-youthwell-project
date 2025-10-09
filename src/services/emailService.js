/**
 * SendGrid Email Service
 *
 * SETUP INSTRUCTIONS:
 * 1. Sign up for SendGrid: https://signup.sendgrid.com/
 * 2. Create an API key: https://app.sendgrid.com/settings/api_keys
 * 3. Add your API key and sender email below
 * 4. For Firebase Cloud Functions, add to functions/index.js
 */

// TODO: Replace with your SendGrid API Key
const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY_HERE'

// TODO: Replace with your verified sender email
const SENDER_EMAIL = 'noreply@yourdomain.com'

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
