<template>
  <div class="chatbot-view">
    <div class="container py-4">
      <!-- Header -->
      <div class="chatbot-header text-center mb-4">
        <h1 class="display-5 fw-bold">
          <i class="bi bi-robot me-2"></i>AI Support Companion
        </h1>
        <p class="text-muted">
          Talk to our AI-powered mental health support assistant powered by Google Gemini
        </p>
        <div class="alert alert-info d-inline-block">
          <i class="bi bi-info-circle me-2"></i>
          This is a supportive AI, not a replacement for professional help
        </div>
      </div>

      <!-- Crisis Alert (shown when crisis detected) -->
      <div v-if="showCrisisAlert" class="alert alert-danger alert-dismissible fade show" role="alert">
        <h5 class="alert-heading">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>Immediate Support Available
        </h5>
        <p class="mb-2">If you're in crisis or need immediate support, please contact:</p>
        <ul class="mb-2">
          <li><strong>Lifeline:</strong> 13 11 14 (24/7 crisis support)</li>
          <li><strong>Kids Helpline:</strong> 1800 55 1800 (ages 5-25)</li>
          <li><strong>Beyond Blue:</strong> 1300 22 4636 (depression/anxiety)</li>
        </ul>
        <button type="button" class="btn-close" @click="showCrisisAlert = false"></button>
      </div>

      <!-- Chat Container -->
      <div class="chat-container card shadow-lg">
        <div class="chat-messages" ref="chatMessages">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="text-center py-5">
              <i class="bi bi-chat-heart display-1 text-primary mb-3"></i>
              <h4>Welcome! How can I support you today?</h4>
              <p class="text-muted mb-4">I'm here to listen and provide mental health support.</p>

              <!-- Suggested Prompts -->
              <div class="suggested-prompts">
                <p class="fw-bold mb-3">Try asking:</p>
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                  <button
                    v-for="(prompt, index) in suggestedPrompts"
                    :key="index"
                    class="btn btn-outline-primary btn-sm"
                    @click="sendSuggestedPrompt(prompt)"
                  >
                    {{ prompt }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar">
              <i :class="message.role === 'user' ? 'bi bi-person-circle' : 'bi bi-robot'"></i>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.text)"></div>
              <div class="message-time">{{ message.timestamp }}</div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message assistant">
            <div class="message-avatar">
              <i class="bi bi-robot"></i>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input">
          <div class="input-group">
            <textarea
              v-model="userInput"
              @keydown.enter.prevent="sendMessage"
              @input="autoResize"
              placeholder="Type your message here... (Press Enter to send)"
              class="form-control"
              rows="1"
              ref="messageInput"
              :disabled="isTyping"
            ></textarea>
            <button
              class="btn btn-primary"
              @click="sendMessage"
              :disabled="!userInput.trim() || isTyping"
            >
              <i class="bi bi-send-fill"></i>
            </button>
            <button
              class="btn btn-outline-secondary"
              @click="clearChat"
              title="Clear conversation"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer text-center mt-3">
        <small class="text-muted">
          <i class="bi bi-shield-check me-1"></i>
          Your conversations are private and not stored permanently. This AI provides general support only.
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { sendMessage as sendGeminiMessage, clearChatHistory, detectCrisis, getSuggestedPrompts } from '../services/geminiService'

const messages = ref([])
const userInput = ref('')
const isTyping = ref(false)
const showCrisisAlert = ref(false)
const chatMessages = ref(null)
const messageInput = ref(null)
const suggestedPrompts = ref(getSuggestedPrompts())

/**
 * Send user message to AI
 */
async function sendMessage() {
  if (!userInput.value.trim() || isTyping.value) return

  const messageText = userInput.value.trim()

  // Check for crisis keywords
  if (detectCrisis(messageText)) {
    showCrisisAlert.value = true
  }

  // Add user message
  messages.value.push({
    role: 'user',
    text: messageText,
    timestamp: getCurrentTime()
  })

  userInput.value = ''
  await scrollToBottom()

  // Show typing indicator
  isTyping.value = true

  try {
    // Get AI response
    const response = await sendGeminiMessage(messageText)

    // Add AI response
    messages.value.push({
      role: 'assistant',
      text: response,
      timestamp: getCurrentTime()
    })

  } catch (error) {
    console.error('Error sending message:', error)
    messages.value.push({
      role: 'assistant',
      text: 'I apologize, but I encountered an error. Please try again or contact our crisis hotlines if you need immediate support.',
      timestamp: getCurrentTime()
    })
  } finally {
    isTyping.value = false
    await scrollToBottom()
  }
}

/**
 * Send a suggested prompt
 */
function sendSuggestedPrompt(prompt) {
  userInput.value = prompt
  sendMessage()
}

/**
 * Clear chat conversation
 */
function clearChat() {
  if (confirm('Are you sure you want to clear this conversation?')) {
    messages.value = []
    clearChatHistory()
    showCrisisAlert.value = false
  }
}

/**
 * Format message text (convert newlines to <br>, make links clickable)
 */
function formatMessage(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
}

/**
 * Get current time formatted
 */
function getCurrentTime() {
  return new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Auto-resize textarea
 */
function autoResize() {
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
  }
}

/**
 * Scroll to bottom of chat
 */
async function scrollToBottom() {
  await nextTick()
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

onMounted(() => {
  messageInput.value?.focus()
})
</script>

<style scoped>
.chatbot-view {
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chatbot-header h1 {
  color: white;
}

.chatbot-header p {
  color: rgba(255, 255, 255, 0.9);
}

.chat-container {
  max-width: 900px;
  margin: 0 auto;
  height: 600px;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.welcome-message {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggested-prompts .btn {
  margin: 5px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #007bff;
  color: white;
}

.message.assistant .message-avatar {
  background: #6f42c1;
  color: white;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .message-avatar {
  margin-right: 0;
  margin-left: 12px;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  word-wrap: break-word;
}

.message.user .message-text {
  background: #007bff;
  color: white;
}

.message-time {
  font-size: 11px;
  color: #6c757d;
  margin-top: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input {
  padding: 15px;
  background: white;
  border-top: 1px solid #dee2e6;
}

.chat-input textarea {
  resize: none;
  border-radius: 20px;
  padding: 10px 15px;
  max-height: 150px;
}

.chat-input .btn {
  border-radius: 20px;
  padding: 10px 20px;
}

.disclaimer {
  color: rgba(255, 255, 255, 0.9);
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 768px) {
  .chat-container {
    height: 500px;
  }

  .message-content {
    max-width: 80%;
  }

  .suggested-prompts .btn {
    font-size: 12px;
  }
}
</style>
