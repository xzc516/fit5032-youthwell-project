# 📧 SendGrid 邮件服务配置指南

## ✅ 当前配置状态

**API Key:** `SG.1bc6af9c-b278-4d11-a624-e75ae4773752` ✅
**发件人邮箱:** `zxuu0151@student.monash.edu` ✅
**配置文件:** `src/services/emailService.js` (第12-15行) ✅

---

## ⚠️ 重要：必须验证发件人邮箱

SendGrid **要求验证发件人身份**才能发送邮件。未验证的邮箱会导致发送失败。

---

## 📋 验证步骤（5分钟）

### 步骤1：登录SendGrid控制台

访问：https://app.sendgrid.com/login

使用你的SendGrid账户登录（注册时使用的账户）

---

### 步骤2：进入发件人验证页面

**方法1（直接链接）：**
```
https://app.sendgrid.com/settings/sender_auth
```

**方法2（导航菜单）：**
```
1. 点击左侧菜单 "Settings"
2. 点击 "Sender Authentication"
```

---

### 步骤3：选择 "Single Sender Verification"

在页面中找到：**"Verify a Single Sender"** 区域

点击按钮：**"Create New Sender"** 或 **"Get Started"**

---

### 步骤4：填写发件人信息

**必填字段：**

| 字段 | 填写内容 | 说明 |
|------|---------|------|
| **From Name** | `YouthWell Support` | 收件人看到的发件人名称 |
| **From Email Address** | `zxuu0151@student.monash.edu` | **必须是你能收邮件的邮箱** |
| **Reply To** | `zxuu0151@student.monash.edu` | 用户回复邮件的地址 |
| **Company Address** | `Wellington Rd, Clayton VIC 3800` | Monash大学地址 |
| **City** | `Clayton` | 城市 |
| **State/Province** | `Victoria` | 州/省 |
| **Zip Code** | `3800` | 邮编 |
| **Country** | `Australia` | 国家 |
| **Nickname** (可选) | `YouthWell` | 内部标识名称 |

**示例填写：**
```
From Name: YouthWell Support
From Email Address: zxuu0151@student.monash.edu
Reply To: zxuu0151@student.monash.edu
Company Address: Wellington Rd, Clayton VIC 3800
City: Clayton
State: Victoria
Zip: 3800
Country: Australia
Nickname: YouthWell
```

---

### 步骤5：验证邮箱

1. **点击 "Create" 或 "Save"**

2. **检查你的Monash学生邮箱** (`zxuu0151@student.monash.edu`)

   你会收到一封来自 SendGrid 的验证邮件：
   ```
   发件人: SendGrid <noreply@sendgrid.com>
   主题: Please Verify Your SendGrid Sender Identity
   ```

3. **点击邮件中的验证链接**
   ```
   邮件内容会包含类似：
   "Click here to verify your sender identity"
   ```

4. **验证成功提示**

   点击链接后，浏览器会打开确认页面：
   ```
   ✅ Sender Identity Verified!
   Your sender zxuu0151@student.monash.edu has been verified.
   ```

---

### 步骤6：确认验证状态

回到 SendGrid 控制台 → Sender Authentication 页面

你应该看到：

```
✅ zxuu0151@student.monash.edu
   Status: Verified
   Nickname: YouthWell
   Created: 2025-10-10
```

---

## 🎯 验证完成后的功能

验证成功后，以下邮件功能将可用：

### 1. 欢迎邮件 📬
**触发时机：** 用户注册成功后

**邮件内容：**
```
发件人: YouthWell Support <zxuu0151@student.monash.edu>
主题: Welcome to YouthWell!

Hello [用户名],

Thank you for joining our mental health support community.
We're here to support you on your wellbeing journey.

Best regards,
The YouthWell Team
```

### 2. 资源邮件 📄
**触发时机：** 用户请求下载资源

**邮件内容：**
```
发件人: YouthWell Support <zxuu0151@student.monash.edu>
主题: YouthWell - Mental Health Resources
附件: mental-health-resources.pdf

Hello [用户名],

Please find attached mental health resources and support information.

If you need immediate help, please contact:
• Lifeline: 13 11 14
• Kids Helpline: 1800 55 1800
• Beyond Blue: 1300 22 4636

Take care,
YouthWell Team
```

### 3. 论坛通知 💬
**触发时机：** 论坛有新帖子

**邮件内容：**
```
发件人: YouthWell Support <zxuu0151@student.monash.edu>
主题: New Post in YouthWell Forum: [帖子标题]

New Forum Post

[作者名] has created a new post:
[帖子标题]

View in Forum →
```

---

## 🧪 测试邮件发送

验证完成后，可以在项目中测试邮件功能：

### 测试代码示例：

**在浏览器控制台运行：**
```javascript
// 导入邮件服务
import { sendWelcomeEmail } from './services/emailService'

// 发送测试邮件到你自己的邮箱
await sendWelcomeEmail('zxuu0151@student.monash.edu', 'Test User')

// 查看控制台输出
// 成功：{ success: true, message: 'Email sent successfully' }
// 失败：{ success: false, message: '错误信息' }
```

### 或在代码中测试：

**修改 `src/views/RegisterView.vue` 注册成功后发送欢迎邮件：**

```javascript
import { sendWelcomeEmail } from '../services/emailService'

async function onSubmit() {
  // ... 注册代码

  // 注册成功后发送欢迎邮件
  if (success) {
    await sendWelcomeEmail(email.value, username.value)
  }
}
```

---

## ❌ 常见错误和解决方案

### 错误1：发送失败 - "Sender not verified"
**原因：** 发件人邮箱未验证

**解决：**
```bash
1. 检查 SendGrid 控制台中邮箱验证状态
2. 重新发送验证邮件（如果过期）
3. 确认点击了邮件中的验证链接
```

---

### 错误2：收不到验证邮件
**原因：** 邮件可能在垃圾邮件文件夹

**解决：**
```bash
1. 检查Monash邮箱的垃圾邮件/Spam文件夹
2. 检查"促销"或"社交"标签页（如果是Gmail）
3. 在SendGrid中重新发送验证邮件
4. 检查邮箱地址拼写是否正确
```

---

### 错误3：验证链接过期
**原因：** 验证链接有时效性（通常24小时）

**解决：**
```bash
1. 回到 SendGrid → Sender Authentication
2. 找到未验证的发件人
3. 点击 "Resend Verification Email"
4. 立即检查邮箱并点击新链接
```

---

### 错误4：API请求失败 - 401 Unauthorized
**原因：** API Key无效或已过期

**解决：**
```bash
1. 检查 emailService.js 中的 API Key 是否正确
2. 在 SendGrid 中重新生成 API Key
3. 更新 emailService.js 中的 SENDGRID_API_KEY
```

---

### 错误5：发送失败 - "Daily send limit exceeded"
**原因：** 免费账户有每日发送限制（通常100封/天）

**解决：**
```bash
1. 等待24小时重置
2. 升级到付费计划（如果需要更多额度）
3. 使用多个发件人分散流量
```

---

## 📊 SendGrid 免费账户限制

| 限制项 | 免费账户 | 说明 |
|--------|---------|------|
| 每日发送量 | 100封/天 | 24小时滚动窗口 |
| 验证发件人数量 | 100个 | 足够使用 |
| API调用 | 无限制 | 不限次数 |
| 附件大小 | 30MB/邮件 | 单封邮件总大小 |
| 有效期 | 永久 | 免费账户不过期 |

**提示：** 100封/天对开发和测试足够了！

---

## 🔐 安全建议

### 1. 保护API Key
```bash
❌ 不要：将API Key提交到公开的Git仓库
✅ 应该：使用环境变量存储API Key

# .env 文件（不要提交到Git）
VITE_SENDGRID_API_KEY=SG.1bc6af9c-b278-4d11-a624-e75ae4773752

# emailService.js
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY
```

### 2. 限制API Key权限
```bash
在SendGrid创建API Key时：
✓ 只选择 "Mail Send" 权限
✗ 不要给予 "Full Access"
```

### 3. 定期轮换API Key
```bash
建议：每3-6个月更换一次API Key
步骤：
1. SendGrid → Settings → API Keys
2. Create API Key → 创建新Key
3. 更新代码中的Key
4. 删除旧Key
```

---

## 📝 配置清单

完成以下步骤确保邮件服务可用：

- [x] API Key已添加到 `emailService.js` ✅
- [x] 发件人邮箱已配置为 `zxuu0151@student.monash.edu` ✅
- [ ] 在SendGrid中验证发件人邮箱 ⚠️ **待完成**
- [ ] 发送测试邮件验证功能
- [ ] （可选）配置环境变量存储API Key

---

## 🔗 相关链接

- **SendGrid控制台:** https://app.sendgrid.com/
- **发件人验证页面:** https://app.sendgrid.com/settings/sender_auth
- **API Keys管理:** https://app.sendgrid.com/settings/api_keys
- **SendGrid文档:** https://docs.sendgrid.com/
- **邮件API文档:** https://docs.sendgrid.com/api-reference/mail-send/mail-send

---

## 📞 获取帮助

### SendGrid支持
- 文档：https://docs.sendgrid.com/
- 社区：https://community.sendgrid.com/
- 支持：https://support.sendgrid.com/

### 项目相关
- 配置状态：查看 [CONFIGURATION_STATUS.md](CONFIGURATION_STATUS.md)
- API清单：查看 [API_SETUP_CHECKLIST.md](API_SETUP_CHECKLIST.md)

---

## ✅ 验证完成标志

验证成功后，你会看到：

1. **SendGrid控制台显示：**
   ```
   ✅ zxuu0151@student.monash.edu - Verified
   ```

2. **测试邮件发送成功：**
   ```javascript
   { success: true, message: 'Email sent successfully' }
   ```

3. **收到测试邮件：**
   ```
   收件箱中有来自 YouthWell Support 的邮件
   ```

---

**下一步：** 立即验证发件人邮箱，5分钟即可完成！🚀

---

**最后更新：** 2025-10-10
**配置者：** YouthWell Development Team
**邮箱：** zxuu0151@student.monash.edu
