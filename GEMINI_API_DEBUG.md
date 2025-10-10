# 🤖 Gemini API调试指南

## 问题现象

AI聊天机器人返回错误消息：
```
I apologize, but I encountered an error. Please try again. If you need immediate support, please call:

• Lifeline: 13 11 14 (24/7)
• Kids Helpline: 1800 55 1800 (ages 5-25)
• Beyond Blue: 1300 22 4636
```

---

## 🔍 诊断步骤

### 1. 检查浏览器控制台

**访问：** http://localhost:5174/chatbot

**打开控制台（F12）并尝试发送消息**

**查看以下日志：**

#### ✅ 成功情况：
```javascript
Calling Gemini API...
Gemini API response status: 200
Gemini API response data: { candidates: [...] }
```

#### ❌ 常见错误：

**错误1：API Key无效**
```javascript
Gemini API response status: 400
Gemini API error response: {
  error: {
    code: 400,
    message: "API key not valid. Please pass a valid API key."
  }
}
```
→ **解决方案：** 检查API Key是否正确

**错误2：API Key过期或被禁用**
```javascript
Gemini API response status: 403
Gemini API error response: {
  error: {
    code: 403,
    message: "The caller does not have permission"
  }
}
```
→ **解决方案：** 在Google Cloud Console重新生成API Key

**错误3：配额限制**
```javascript
Gemini API response status: 429
Gemini API error response: {
  error: {
    code: 429,
    message: "Resource has been exhausted (e.g. check quota)."
  }
}
```
→ **解决方案：** 等待几分钟后重试（免费层限制：60请求/分钟）

**错误4：请求格式错误**
```javascript
Gemini API response status: 400
Gemini API error response: {
  error: {
    code: 400,
    message: "Invalid JSON payload received..."
  }
}
```
→ **解决方案：** 检查请求格式

**错误5：内容安全过滤**
```javascript
Gemini API response data: {
  candidates: [],
  promptFeedback: {
    blockReason: "SAFETY"
  }
}
```
→ **解决方案：** 调整安全设置或重新措辞消息

---

## 🔧 快速修复

### 方法1：验证API Key

在浏览器控制台运行：

```javascript
// 测试API Key
const API_KEY = 'AIzaSyB_2Jlmp0zWVc7SWX-uxvnIHAwE-mo4S5s'
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

const testRequest = await fetch(`${API_URL}?key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      role: 'user',
      parts: [{ text: 'Hello, how are you?' }]
    }]
  })
})

console.log('Status:', testRequest.status)
const result = await testRequest.json()
console.log('Response:', result)
```

**✅ 成功输出：**
```javascript
Status: 200
Response: {
  candidates: [{
    content: {
      parts: [{ text: "I'm doing well, thank you for asking!" }]
    }
  }]
}
```

**❌ 失败输出：**
```javascript
Status: 400 (或 403)
Response: {
  error: {
    code: 400,
    message: "API key not valid..."
  }
}
```

---

### 方法2：检查API Key配置

**文件：** [src/services/geminiService.js](src/services/geminiService.js)

**第5行：**
```javascript
const GEMINI_API_KEY = 'AIzaSyB_2Jlmp0zWVc7SWX-uxvnIHAwE-mo4S5s'
```

**验证：**
1. API Key长度应该是39个字符
2. 以`AIza`开头
3. 没有空格或特殊字符

---

### 方法3：重新生成API Key

如果API Key无效，需要重新生成：

1. **访问Google AI Studio**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **创建新的API Key**
   - 点击 "Create API Key"
   - 选择或创建一个Google Cloud项目
   - 复制新的API Key

3. **更新配置**
   ```javascript
   // src/services/geminiService.js
   const GEMINI_API_KEY = 'YOUR_NEW_API_KEY_HERE'
   ```

---

### 方法4：使用简化的请求格式

如果当前格式有问题，尝试简化：

```javascript
// 简化版本（最小请求）
const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: userMessage }]
    }]
  })
})
```

---

## 🐛 常见问题

### Q1: API Key有效但仍然报错400
**可能原因：**
- 请求体格式不正确
- 包含了不支持的参数
- 内容违反了安全策略

**解决方案：**
查看完整错误消息，通常会说明具体问题

### Q2: 偶尔成功，偶尔失败
**可能原因：**
- 网络不稳定
- API配额限制（免费层：60请求/分钟）
- 内容安全过滤不一致

**解决方案：**
- 添加重试机制
- 降低请求频率
- 避免敏感内容

### Q3: 返回空响应
**可能原因：**
- 安全过滤阻止了响应
- API返回格式不符合预期

**检查：**
```javascript
console.log('Full response:', data)
console.log('Candidates:', data.candidates)
console.log('Prompt feedback:', data.promptFeedback)
```

---

## 🔄 备用方案

如果Gemini API持续失败，可以临时使用模拟响应：

```javascript
// src/services/geminiService.js

export async function sendMessage(userMessage) {
  // 临时：使用模拟响应
  if (true) { // 改为false恢复API调用
    const mockResponses = {
      'anxious': 'I understand you\'re feeling anxious. Here are some quick tips...',
      'depressed': 'Thank you for sharing. It takes courage to talk about depression...',
      'stress': 'Stress is a common experience. Let\'s explore some coping strategies...',
      'default': 'I\'m here to listen and support you. Can you tell me more about how you\'re feeling?'
    }

    const keyword = Object.keys(mockResponses).find(k =>
      userMessage.toLowerCase().includes(k)
    )

    return mockResponses[keyword] || mockResponses.default
  }

  // 原有API调用代码...
}
```

---

## 📊 API限制（免费层）

Gemini API免费层限制：
- **请求速率：** 60请求/分钟
- **每日配额：** 1,500请求/天
- **Token限制：** 每请求最多32,000 tokens

**如果超过限制：**
- 等待1分钟后重试
- 或者升级到付费计划

---

## ✅ 验证清单

运行AI聊天机器人前，确认：

- [ ] API Key已正确配置（39字符，以AIza开头）
- [ ] 浏览器控制台无CORS错误
- [ ] 网络连接正常
- [ ] 未超过API配额限制
- [ ] Gemini API服务正常运行

---

## 📞 下一步

**请提供以下信息以便诊断：**

1. **浏览器控制台完整日志**
   - 刷新页面
   - 访问 /chatbot
   - 发送消息
   - 复制控制台所有输出

2. **具体错误信息**
   - `Gemini API response status: ???`
   - `Gemini API error response: {...}`

3. **测试简单请求**
   - 在控制台运行上面的"方法1"测试代码
   - 告诉我status和response

---

**当前API Key:** `AIzaSyB_2Jlmp0zWVc7SWX-uxvnIHAwE-mo4S5s`

**告诉我控制台显示的错误，我会帮您解决！** 🔍
