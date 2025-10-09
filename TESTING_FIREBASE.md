# Firebase 集成测试指南

## ✅ 已修复的问题

### 1. Content Security Policy (CSP) 错误 ✅
**问题**: `Refused to connect to 'https://identitytoolkit.googleapis.com'`

**解决方案**: 更新 [index.html](index.html) 第 22 行，添加 Firebase 域名到 `connect-src`:
```html
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://cdn.jsdelivr.net;
```

### 2. 表单 Autocomplete 警告 ✅
**问题**: DOM 警告建议添加 autocomplete 属性

**解决方案**:
- [LoginView.vue](src/views/LoginView.vue): 添加 `autocomplete="email"` 和 `autocomplete="current-password"`
- [RegisterView.vue](src/views/RegisterView.vue): 添加 `autocomplete="email"`, `autocomplete="username"`, `autocomplete="new-password"`

## 🧪 测试步骤

### 前提条件
在开始测试前，必须在 Firebase Console 完成以下配置：

1. **启用 Authentication**
   - 访问 [Firebase Console - Authentication](https://console.firebase.google.com/project/fit5032-youthwell-project/authentication/providers)
   - 启用 "Email/Password" 认证方式

2. **创建 Firestore Database**
   - 访问 [Firebase Console - Firestore](https://console.firebase.google.com/project/fit5032-youthwell-project/firestore)
   - 创建数据库（测试模式）

详细步骤请参考 [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

### 测试 1: 用户注册
1. 刷新浏览器 (Ctrl+Shift+R 硬刷新)
2. 打开开发者工具 (F12)
3. 检查 Console 应显示: `Firebase initialized successfully`
4. 访问注册页面
5. 填写表单:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123!` (应显示 MEDIUM 或 STRONG)
   - Confirm Password: `Test123!`
   - Role: `user`
6. 点击 "Create Account"
7. 应该显示成功消息并重定向到登录页

**预期结果**:
- ✅ 无 CSP 错误
- ✅ 无 autocomplete 警告
- ✅ 注册成功
- ✅ Firebase Console > Authentication > Users 中出现新用户
- ✅ Firestore > users 集合中有用户文档

### 测试 2: 用户登录
1. 在登录页面输入:
   - Email: `test@example.com`
   - Password: `Test123!`
2. 点击 "Login"
3. 应该重定向到 Forum 页面
4. 导航栏显示: "Hello, testuser (user)"

**预期结果**:
- ✅ 登录成功
- ✅ 用户信息正确显示
- ✅ 可以访问 Forum 和 Map 页面
- ✅ 不能访问 Admin 页面

### 测试 3: 创建论坛帖子
1. 登录后访问 Forum
2. 填写帖子表单:
   - Title: `My First Mental Health Post`
   - Content: `This is a test post about mental health support`
   - Rating: `4`
3. 点击 "Publish Post"
4. 应该看到新帖子出现在列表顶部

**预期结果**:
- ✅ 帖子创建成功
- ✅ Firestore > posts 集合中有新文档
- ✅ 实时更新（在另一个浏览器窗口打开应该也能看到）

### 测试 4: 评分功能
1. 点击帖子的星星评分
2. 选择不同的评分值
3. 刷新页面，评分应该保持

**预期结果**:
- ✅ 评分更新成功
- ✅ 平均评分正确计算
- ✅ 数据持久化到 Firestore

### 测试 5: Admin 功能
1. 创建管理员账户:
   - Email: `admin@test.com`
   - Username: `admin`
   - Password: `Admin123!`
   - Role: `admin`
2. 登录管理员账户
3. 导航栏应显示 "Admin Panel" 链接
4. 访问 Admin Panel
5. 应该看到用户列表和统计数据

**预期结果**:
- ✅ Admin 可以访问 Admin Panel
- ✅ 普通用户访问 /admin 会被重定向
- ✅ 显示所有用户
- ✅ 可以修改用户角色

### 测试 6: 登出功能
1. 点击导航栏的 "Logout"
2. 应该重定向到登录页
3. 尝试访问 /forum 应该被拦截并重定向到登录页

**预期结果**:
- ✅ 登出成功
- ✅ 认证状态清除
- ✅ 路由守卫正常工作

## 🐛 常见问题排查

### 问题: 仍然看到 CSP 错误
**解决**:
1. 硬刷新浏览器 (Ctrl+Shift+R)
2. 清除浏览器缓存
3. 确认 [index.html](index.html) 已保存更改

### 问题: `auth/operation-not-allowed`
**解决**: 在 Firebase Console 启用 Email/Password 认证

### 问题: `permission-denied`
**解决**:
1. 检查 Firestore 安全规则
2. 临时使用测试模式规则
3. 确认用户已登录

### 问题: 数据不实时更新
**解决**:
1. 检查浏览器 Console 是否有错误
2. 确认 Firestore 规则允许读取
3. 检查网络连接

## 📊 验证清单

使用此清单验证 Firebase 集成:

- [ ] Firebase 初始化成功（Console 显示消息）
- [ ] 无 CSP 错误
- [ ] 无 autocomplete 警告
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 论坛帖子创建成功
- [ ] 评分功能正常
- [ ] 数据实时同步
- [ ] Admin 权限控制正确
- [ ] 登出功能正常
- [ ] 路由守卫工作正常
- [ ] 数据在 Firestore 中可见

## 🎯 下一步

完成所有测试后，你可以：
1. 添加更多功能（如帖子编辑、删除）
2. 改进 UI/UX
3. 添加更多安全规则
4. 实现其他设计报告中的功能

---

**需要帮助？** 查看 [FIREBASE_SETUP.md](FIREBASE_SETUP.md) 或 Firebase 文档。
