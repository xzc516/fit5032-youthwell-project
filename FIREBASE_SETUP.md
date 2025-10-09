# Firebase 设置指南

## 🔴 重要：解决 `auth/network-request-failed` 错误

此错误通常是因为 Firebase 项目未正确配置。请按照以下步骤设置：

## 步骤 1: 访问 Firebase Console

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目 `fit5032-youthwell-project`

## 步骤 2: 启用 Authentication

1. 在左侧菜单中点击 **"Authentication"**
2. 点击 **"Get Started"** 或 **"Sign-in method"** 选项卡
3. 启用 **Email/Password** 认证方式:
   - 点击 "Email/Password"
   - 切换为 **"已启用"**
   - 点击 **"保存"**

## 步骤 3: 创建 Firestore Database

1. 在左侧菜单中点击 **"Firestore Database"**
2. 点击 **"创建数据库"**
3. 选择启动模式:
   - **测试模式** (开发阶段推荐)
   - 或 **生产模式** (需要配置安全规则)
4. 选择数据库位置（推荐: `asia-southeast1` 或 `australia-southeast1`）
5. 点击 **"启用"**

## 步骤 4: 配置 Firestore 安全规则

在 Firestore Database > 规则 中，添加以下规则：

### 开发/测试规则（临时使用）:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 生产规则（推荐）:
```
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
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
        (resource.data.authorId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## 步骤 5: 验证配置

打开浏览器开发者工具 (F12)，检查 Console 是否显示:
```
Firebase initialized successfully
```

## 常见问题排查

### 问题 1: `auth/network-request-failed`
**原因**:
- Firebase Authentication 未启用
- 网络连接问题
- 防火墙拦截

**解决方案**:
1. 确认已启用 Email/Password 认证
2. 检查网络连接
3. 暂时关闭防火墙/VPN 测试

### 问题 2: `permission-denied`
**原因**: Firestore 安全规则太严格

**解决方案**:
1. 使用测试模式规则（开发阶段）
2. 或调整生产规则

### 问题 3: 无法注册用户
**原因**: Email/Password 认证未启用

**解决方案**:
在 Firebase Console > Authentication > Sign-in method 启用 Email/Password

## 下一步

配置完成后，重启开发服务器:
```bash
npm run dev
```

然后尝试注册新用户进行测试。

## 测试账号创建

完成配置后，建议创建测试账号:

1. 访问注册页面
2. 创建账号:
   - Email: `admin@test.com`
   - Username: `admin`
   - Password: `admin123`
   - Role: `admin`

3. 创建普通用户:
   - Email: `user@test.com`
   - Username: `testuser`
   - Password: `test123`
   - Role: `user`

## 验证数据

在 Firebase Console > Firestore Database 中，你应该能看到:
- `users` 集合（存储用户信息）
- `posts` 集合（存储论坛帖子）

---

**需要帮助？** 检查浏览器控制台的错误信息，或查看 [Firebase 文档](https://firebase.google.com/docs)
