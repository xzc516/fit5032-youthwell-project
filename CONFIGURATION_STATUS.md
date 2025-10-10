# ⚙️ YouthWell 配置状态

## 📊 API配置总览

| API服务 | 状态 | 优先级 | 配置位置 |
|---------|------|--------|----------|
| Firebase Authentication | 🔴 **待配置** | 必须 | Firebase Console |
| Firestore Database | 🔴 **待配置** | 必须 | Firebase Console |
| MapBox Token | 🟢 **已配置** ✅ | 推荐 | `src/services/mapService.js` |
| SendGrid API | 🟡 **部分配置** | 可选 | `src/services/emailService.js` |

---

## ✅ 已配置的API

### MapBox Access Token ✅
**状态：** 🟢 完全配置

**Token：** `pk.eyJ1IjoibWVyY3VyeTA1MTYi...`

**文件：** [src/services/mapService.js](src/services/mapService.js) (第13行)

**已启用功能：**
- ✅ 交互式地图
- ✅ 导航路线计算
- ✅ 地理编码
- ✅ 距离和时间估算

**测试方法：**
```bash
1. 运行项目：npm run dev
2. 登录后访问：/map
3. 点击 "My Location" 按钮
4. 选择任意服务点击 "Directions"
5. 应该看到导航路线和逐步指示
```

---

### SendGrid API Key ✅
**状态：** 🟡 API Key已配置，需验证发件人

**API Key：** `SG.1bc6af9c-b278-4d11-a624-e75ae4773752`

**文件：** [src/services/emailService.js](src/services/emailService.js) (第7行)

**待完成：**
- ⚠️ 验证发件人邮箱（SendGrid控制台）
- ⚠️ 更新发件人地址（第19行）

**配置步骤：**
```bash
1. 访问 https://app.sendgrid.com/settings/sender_auth
2. 点击 "Verify a Single Sender"
3. 填写发件人信息：
   - From Name: YouthWell Support
   - From Email: noreply@yourdomain.com
4. 检查邮箱并验证
5. 更新 emailService.js 第19行的发件人地址
```

---

## 🔴 待配置的API（必须）

### 1. Firebase Authentication
**状态：** 🔴 **必须立即配置**

**为什么必须：** 用户无法注册和登录

**配置步骤：**
```bash
Firebase Console: https://console.firebase.google.com/project/fit5032-youthwell-project

1. 点击左侧 "Authentication"
2. 点击 "Get Started"
3. 选择 "Sign-in method"
4. 启用 "Email/Password"
5. 点击 "Save"
```

**验证方法：**
```bash
1. 运行项目：npm run dev
2. 访问：/register
3. 注册新账户
4. 如果成功跳转到 /forum → ✅ 配置正确
```

---

### 2. Firestore Database
**状态：** 🔴 **必须立即配置**

**为什么必须：** Dashboard、论坛、评估无法保存数据

**当前错误：**
```
Failed to load dashboard data. Please try again.
```

**配置步骤：**
```bash
Firebase Console: https://console.firebase.google.com/project/fit5032-youthwell-project

1. 点击左侧 "Firestore Database"
2. 点击 "Create database"
3. 选择 "Start in test mode" (开发环境)
4. 选择位置：australia-southeast1 (Sydney)
5. 点击 "Enable"
```

**验证方法：**
```bash
1. 登录账户
2. 访问：/dashboard
3. 如果看到统计卡片（即使为0）→ ✅ 配置正确
4. 如果仍显示错误 → ❌ 重新检查配置
```

---

## 📋 配置优先级

### 🔥 立即配置（项目无法运行）
1. ✅ **Firebase Authentication** - 2分钟
2. ✅ **Firestore Database** - 2分钟

### 🌟 推荐配置（增强体验）
3. ✅ **MapBox Token** - 已完成 ✅

### 💡 可选配置（额外功能）
4. ⚠️ **SendGrid发件人验证** - 5分钟

---

## 🚀 快速开始（最小配置）

**5分钟配置清单：**

```bash
☐ 步骤1：Firebase Authentication (2分钟)
   → console.firebase.google.com
   → Authentication → Email/Password → Enable

☐ 步骤2：Firestore Database (2分钟)
   → console.firebase.google.com
   → Firestore Database → Create → Test mode → Enable

☐ 步骤3：测试项目 (1分钟)
   → npm run dev
   → 注册账户
   → 访问 /dashboard
   → 检查是否有错误

✅ 完成！项目可以正常运行
```

---

## 🔍 配置验证清单

### Firebase配置验证
- [ ] 访问 `/register` 能成功注册
- [ ] 访问 `/login` 能成功登录
- [ ] 访问 `/dashboard` 能看到统计卡片
- [ ] 访问 `/forum` 能发帖并保存
- [ ] 访问 `/assessment` 能保存评估结果

### MapBox配置验证
- [x] 访问 `/map` 能看到服务列表 ✅
- [x] 点击 "My Location" 能获取位置 ✅
- [x] 点击 "Directions" 能看到导航路线 ✅
- [x] 显示距离和时间估算 ✅

### SendGrid配置验证
- [x] API Key已配置 ✅
- [ ] 发件人邮箱已验证
- [ ] 能发送测试邮件

---

## 📂 配置文件清单

### 已配置文件
- ✅ `src/firebase/config.js` - Firebase配置
- ✅ `src/services/mapService.js` - MapBox Token已添加
- ✅ `src/services/emailService.js` - SendGrid API Key已添加

### 需要操作的外部控制台
- 🔴 Firebase Console - 启用Authentication和Firestore
- 🟡 SendGrid Console - 验证发件人邮箱

---

## ⚠️ 常见问题

### Q: 为什么显示 "Failed to load dashboard data"？
**A:** Firestore数据库未创建。按照上面步骤创建即可。

### Q: 为什么无法注册账户？
**A:** Firebase Authentication未启用。在Firebase Console中启用Email/Password。

### Q: 地图功能能用吗？
**A:** ✅ 完全可用！MapBox Token已配置。

### Q: 邮件功能能用吗？
**A:** ⚠️ API Key已配置，但需要验证发件人邮箱才能发送邮件。

---

## 📞 获取帮助

### 相关文档
- [API_SETUP_CHECKLIST.md](API_SETUP_CHECKLIST.md) - 详细配置步骤
- [FEATURES_SUMMARY.md](FEATURES_SUMMARY.md) - 功能总览
- [QUICK_START.md](QUICK_START.md) - 快速开始指南

### 官方文档
- Firebase: https://firebase.google.com/docs
- MapBox: https://docs.mapbox.com/
- SendGrid: https://docs.sendgrid.com/

---

## 📈 配置进度

```
总体进度: 50% (2/4)

✅ MapBox Token        [████████████████████] 100%
✅ SendGrid API Key    [████████████████░░░░] 80%
🔴 Firebase Auth       [░░░░░░░░░░░░░░░░░░░░] 0%
🔴 Firestore Database  [░░░░░░░░░░░░░░░░░░░░] 0%
```

**下一步：** 配置 Firebase Authentication 和 Firestore Database

---

**最后更新：** 2025-10-10
**配置者：** YouthWell Development Team
