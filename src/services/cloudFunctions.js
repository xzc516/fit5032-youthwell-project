/**
 * Cloud Functions Service
 * Handles communication with Firebase Cloud Functions for server-side operations
 */

// Cloud Functions URLs (replace with your actual deployed URLs)
const CLOUD_FUNCTIONS_BASE_URL = 'https://us-central1-fit5032-youthwell-project.cloudfunctions.net'

/**
 * Get user growth trend from Cloud Functions
 */
export async function getUserGrowthTrend() {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/getUserGrowthTrend`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user growth trend:', error)
    throw error
  }
}

/**
 * Get forum post categories from Cloud Functions
 */
export async function getForumPostCategories() {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/getForumPostCategories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching forum post categories:', error)
    throw error
  }
}

/**
 * Send bulk email through Cloud Functions
 */
export async function sendBulkEmail(emailData) {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/sendBulkEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error sending bulk email:', error)
    throw error
  }
}

/**
 * Export data to CSV through Cloud Functions
 */
export async function exportDataToCSV(dataType) {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/exportData?dataType=${dataType}`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get filename from response headers
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `youthwell-${dataType}.csv`

    // Create blob and download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, filename }
  } catch (error) {
    console.error('Error exporting data:', error)
    throw error
  }
}

/**
 * Process assessment results through Cloud Functions
 */
export async function processAssessmentResults(userId) {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/processAssessmentResults`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error processing assessment results:', error)
    throw error
  }
}

/**
 * Check if Cloud Functions are available
 */
export async function checkCloudFunctionsHealth() {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/getUserStats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.ok
  } catch (error) {
    console.error('Cloud Functions health check failed:', error)
    return false
  }
}

export default {
  getUserStats,
  sendBulkEmail,
  exportDataToCSV,
  processAssessmentResults,
  checkCloudFunctionsHealth
}
