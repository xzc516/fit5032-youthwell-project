# 🔥 Firebase配置指南

## 当前状态

✅ Firebase已初始化，但**Firestore数据库尚未启用**

这就是为什么您看到 "Failed to load dashboard data" 错误的原因。

---

## 🚀 快速修复（5分钟）

### 步骤1：启用Firestore数据库

1. **访问Firebase控制台**
   ```
   https://console.firebase.google.com/project/fit5032-youthwell-project
   ```

2. **点击左侧菜单 "Firestore Database"**

3. **点击 "Create database" 按钮**

4. **选择启动模式**
   - **开发环境：** 选择 "**Start in test mode**" ✅
   - **生产环境：** 选择 "Start in production mode"（需要配置安全规则）

5. **选择位置**
   - 推荐：**australia-southeast1 (Sydney)**
   - 备选：**asia-southeast1 (Singapore)**

6. **点击 "Enable" 按钮**

   ⏱️ 通常需要30秒-2分钟创建数据库

---

### 步骤2：启用Firebase Authentication

1. **点击左侧菜单 "Authentication"**

2. **点击 "Get Started" 按钮**

3. **选择 "Sign-in method" 标签**

4. **启用 "Email/Password"**
   - 点击 "Email/Password"
   - 启用第一个选项（Email/Password）
   - 点击 "Save"

---

### 步骤3：配置Firestore安全规则（可选）

**开发环境（推荐）:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

**生产环境（更安全）:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Posts collection
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }

    // Assessment results
    match /assessmentResults/{resultId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## ✅ 验证配置

### 1. 检查Firestore是否已启用

打开浏览器控制台（F12），运行项目后查看是否有以下消息：

```javascript
// ✅ 成功
"Firebase initialized successfully"

// ❌ 失败
"Firestore not initialized"
```

### 2. 测试功能

启用Firestore后，以下功能应该正常工作：

- ✅ **Dashboard** - 显示统计数据（即使为0）
- ✅ **Forum** - 创建和查看帖子
- ✅ **Assessment** - 保存评估结果
- ✅ **Appointments** - 预约管理

---

## 🔧 如果仍然出错

### 错误1：Permission Denied
```
FirebaseError: Missing or insufficient permissions
```

**解决方案：**
- 确保Firestore安全规则设置为测试模式（开发环境）
- 或者配置正确的生产安全规则

### 错误2：Failed Precondition
```
FirebaseError: The query requires an index
```

**解决方案：**
- 点击错误消息中的链接，Firebase会自动创建索引
- 或者手动在Firestore控制台创建索引

### 错误3：Auth未启用
```
Error: Firebase Authentication is not enabled
```

**解决方案：**
- 在Firebase控制台启用Authentication
- 启用Email/Password登录方法

---

## 📋 Firestore集合结构

启用Firestore后，应用会自动创建以下集合：

### 1. `users` 集合
```javascript
{
  uid: "user123",
  username: "john_doe",
  email: "john@example.com",
  role: "user",
  createdAt: Timestamp
}
```

### 2. `posts` 集合
```javascript
{
  title: "My post title",
  summary: "Post content...",
  author: "john_doe",
  authorId: "user123",
  category: "anxiety",
  rating: 3,
  ratings: [],
  timestamp: Timestamp
}
```

### 3. `assessmentResults` 集合
```javascript
{
  userId: "user123",
  assessmentType: "phq9",
  score: 12,
  severity: "Moderate depression",
  responses: [0, 1, 2, ...],
  timestamp: Timestamp
}
```

### 4. `appointments` 集合
```javascript
{
  userId: "user123",
  username: "john_doe",
  serviceType: "counseling",
  counselor: "Dr. Sarah Johnson",
  start: "2025-10-15T10:00:00",
  end: "2025-10-15T11:00:00",
  duration: 60,
  status: "confirmed",
  createdAt: Timestamp
}
```

---

## 🆘 临时降级方案

**如果暂时不想配置Firestore，应用仍然可以工作！**

我已经修改了Dashboard组件，即使Firestore未启用也能正常显示：

✅ **可用功能（无需Firestore）：**
- Home页面
- 地图功能（MapBox）
- AI聊天机器人（Gemini API）
- 资源中心
- 危机热线

❌ **需要Firestore的功能：**
- Dashboard统计数据
- 论坛帖子保存
- 评估结果保存
- 预约管理
- 管理员仪表板数据

---

## 📞 获取帮助

### Firebase官方文档
- **Firestore入门：** https://firebase.google.com/docs/firestore/quickstart
- **Authentication设置：** https://firebase.google.com/docs/auth/web/start

### 项目文档
- [API_SETUP_CHECKLIST.md](API_SETUP_CHECKLIST.md)
- [CONFIGURATION_STATUS.md](CONFIGURATION_STATUS.md)
- [INNOVATION_FEATURES.md](INNOVATION_FEATURES.md)

---

## ⚡ 快速启动命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```

---

**配置完成后，刷新页面即可看到所有功能正常工作！** 🎉
