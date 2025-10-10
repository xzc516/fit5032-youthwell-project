# 🔑 API配置清单

## ⚠️ 必须配置的API（项目无法运行）

### 1. Firebase Configuration ✅ CRITICAL
**状态：** 🔴 **必须配置（已有配置，需启用服务）**

**Firebase Console:** https://console.firebase.google.com/project/fit5032-youthwell-project

#### 步骤1：启用 Firebase Authentication
```bash
1. 进入 Firebase Console
2. 点击左侧菜单 "Authentication"
3. 点击 "Get Started"
4. 选择 "Sign-in method" 选项卡
5. 启用 "Email/Password" 提供商
   ✓ 点击 "Email/Password"
   ✓ 开启 "Enable"
   ✓ 点击 "Save"
```

#### 步骤2：创建 Firestore Database
```bash
1. 进入 Firebase Console
2. 点击左侧菜单 "Firestore Database"
3. 点击 "Create database"
4. 选择 "Start in test mode" (开发环境)
   或 "Start in production mode" (生产环境，需配置规则)
5. 选择服务器位置：
   推荐：australia-southeast1 (Sydney)
6. 点击 "Enable"
```

**影响的功能：**
- ❌ 用户注册和登录（Authentication）
- ❌ Dashboard数据加载（Firestore）
- ❌ 论坛帖子存储（Firestore）
- ❌ 评估结果保存（Firestore）

**错误提示：**
```
Failed to load dashboard data. Please try again.
```

---

## 🗺️ 可选API（功能受限但不影响运行）

### 2. MapBox Access Token
**状态：** 🟢 **已配置** ✅

**Token：** `pk.eyJ1IjoibWVyY3VyeTA1MTYiLCJhIjoiY21nanh3ZW54MG5sejJqbXo3MGplY3RiNiJ9.fD5qndG654WO3dY0V3FCQw`

**文件位置：** `src/services/mapService.js` (第13行)

**已启用的功能：**
- ✅ 交互式地图可视化
- ✅ 导航路线和逐步指示
- ✅ 地理编码和地址搜索
- ✅ 服务列表展示
- ✅ 地理位置定位

**地图功能：**
- 5个墨尔本心理健康服务位置标记
- 用户当前位置定位
- 最近服务查找（Haversine算法）
- MapBox Directions API导航
- Turn-by-turn逐步指示
- 距离和时间计算

---

### 3. SendGrid Email Service
**状态：** 🟢 **已配置（需验证发件人邮箱）**

**API Key：** ✅ 已添加到 `src/services/emailService.js`
```javascript
const SENDGRID_API_KEY = 'SG.1bc6af9c-b278-4d11-a624-e75ae4773752'
```

#### 验证发件人步骤：
```bash
1. 访问 https://app.sendgrid.com/login
2. 登录 SendGrid 账户
3. 进入 Settings → Sender Authentication
4. 点击 "Verify a Single Sender"
5. 填写发件人信息：
   - From Name: YouthWell Support
   - From Email: noreply@yourdomain.com (你的域名邮箱)
   - Reply To: support@yourdomain.com
6. 检查邮箱并点击验证链接
7. 更新 src/services/emailService.js 第 19 行：
   from: 'noreply@yourdomain.com'
```

**影响的功能：**
- ⚠️ 欢迎邮件发送（用户注册后）
- ⚠️ 资源邮件发送（PDF附件）
- ⚠️ 帖子通知邮件
- ✅ 其他功能不受影响

**备用方案：**
```
邮件功能为增强功能，不影响核心业务
用户仍可：
- 正常注册登录
- 使用所有评估工具
- 参与论坛讨论
- 查看资源
```

---

## 📋 配置优先级

### 优先级1：必须立即配置 🔴
```
1. Firebase Authentication    （否则无法登录）
2. Firestore Database         （否则无法存储数据）
```

### 优先级2：建议配置 🟡
```
3. MapBox Token              （增强地图体验）
```

### 优先级3：可选配置 🟢
```
4. SendGrid 发件人验证        （启用邮件通知）
```

---

## 🔧 配置验证

### 检查Firebase是否配置成功：
```bash
1. 运行项目：npm run dev
2. 访问注册页面：http://localhost:5173/register
3. 尝试注册新账户
4. 如果成功跳转到论坛页面 → ✅ Firebase配置正确
5. 如果显示错误 → ❌ 检查Firebase Console服务是否启用
```

### 检查Firestore是否配置成功：
```bash
1. 登录账户后访问：http://localhost:5173/dashboard
2. 如果看到统计数据（即使为0） → ✅ Firestore配置正确
3. 如果显示 "Failed to load dashboard data" → ❌ 检查Firestore数据库是否创建
```

### 检查MapBox是否配置成功：
```bash
1. 访问：http://localhost:5173/map
2. 如果看到交互式地图 → ✅ MapBox配置正确
3. 如果看到 "MapBox Integration" 占位符 → ⚠️ Token未配置（功能受限）
```

---

## 🚀 快速配置指南（5分钟）

### 最小化配置（仅配置必需API）：

```bash
步骤1：Firebase Authentication (2分钟)
→ Firebase Console → Authentication → Email/Password → Enable

步骤2：Firestore Database (2分钟)
→ Firebase Console → Firestore Database → Create → Test mode → Enable

步骤3：测试 (1分钟)
→ 运行项目 → 注册账户 → 访问Dashboard

✅ 完成！项目可以正常运行
```

### 完整配置（包含所有API）：

```bash
+ 步骤4：MapBox Token (3分钟)
→ MapBox注册 → 复制Token → 更新 mapService.js

+ 步骤5：SendGrid验证 (5分钟)
→ SendGrid登录 → 验证发件人 → 更新 emailService.js

✅ 完成！所有功能可用
```

---

## 📝 常见错误和解决方案

### 错误1：Failed to load dashboard data
**原因：** Firestore数据库未创建
**解决：** 在Firebase Console中创建Firestore数据库

### 错误2：auth/network-request-failed
**原因：** Firebase Authentication未启用
**解决：** 在Firebase Console中启用Email/Password认证

### 错误3：地图不显示
**原因：** MapBox Token未配置
**解决：** 在mapService.js中添加有效的MapBox Token（或使用列表视图）

### 错误4：邮件发送失败
**原因：** SendGrid发件人未验证
**解决：** 在SendGrid中验证发件人邮箱地址

---

## 📞 获取帮助

### Firebase文档
- 官方文档：https://firebase.google.com/docs
- Authentication：https://firebase.google.com/docs/auth
- Firestore：https://firebase.google.com/docs/firestore

### MapBox文档
- 官方文档：https://docs.mapbox.com/
- Access Tokens：https://docs.mapbox.com/help/how-mapbox-works/access-tokens/

### SendGrid文档
- 官方文档：https://docs.sendgrid.com/
- Sender Authentication：https://docs.sendgrid.com/ui/sending-email/sender-verification

---

**最后更新：** 2025-10-10
**项目：** YouthWell Mental Health Platform
