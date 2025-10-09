# 基于角色的路由跳转说明

## ✅ 已实现的功能

### 🔐 登录后的智能跳转

根据用户角色，登录后会自动跳转到不同的页面：

#### 👤 普通用户 (role: `user`)
登录后跳转到: **`/forum`** (论坛页面)

#### 👨‍💼 管理员 (role: `admin`)
登录后跳转到: **`/admin`** (管理面板)

### 📍 路由守卫逻辑

#### 1. 登录/注册页面重定向
如果用户已登录，访问以下页面会自动重定向：
- `/login` → 根据角色跳转到 `/forum` 或 `/admin`
- `/register` → 根据角色跳转到 `/forum` 或 `/admin`
- `/` → 根据角色跳转到 `/forum` 或 `/admin`

#### 2. 权限保护
- **User** 可以访问: `/forum`, `/map`
- **Admin** 可以访问: `/forum`, `/map`, `/admin`
- **未登录用户**: 访问受保护页面会重定向到 `/login?redirect=<目标页面>`

#### 3. 未授权访问处理
如果用户尝试访问没有权限的页面：
- **User** 访问 `/admin` → 重定向到 `/forum`
- **Admin** 访问受限页面 → 重定向到 `/admin`

## 🧪 测试场景

### 场景 1: 普通用户登录
1. 注册账户，Role 选择 `user`
2. 登录
3. **预期**: 自动跳转到 `/forum`
4. 导航栏显示: "Hello, [username] (user)"
5. 看不到 "Admin Panel" 链接

### 场景 2: 管理员登录
1. 注册账户，Role 选择 `admin`
2. 登录
3. **预期**: 自动跳转到 `/admin`
4. 导航栏显示: "Hello, [username] (admin)"
5. 可以看到 "Admin Panel" 链接

### 场景 3: 普通用户尝试访问管理面板
1. 以普通用户身份登录
2. 手动访问 `http://localhost:5173/admin`
3. **预期**: 自动重定向到 `/forum`
4. 看到"未授权"消息（可选）

### 场景 4: 已登录用户访问登录页
1. 以任何角色登录
2. 访问 `/login` 或 `/register`
3. **预期**:
   - User → 重定向到 `/forum`
   - Admin → 重定向到 `/admin`

### 场景 5: 重定向参数保留
1. 未登录状态访问 `/map`
2. 被重定向到 `/login?redirect=/map`
3. 登录后
4. **预期**: 自动跳转回 `/map`（而不是默认页面）

## 📝 代码实现

### LoginView.vue
```javascript
// 登录成功后根据角色跳转
if (auth.currentUser?.role === 'admin') {
  targetRoute = '/admin'
} else {
  targetRoute = '/forum'
}
```

### router/index.js
```javascript
// 路由守卫
if (auth.isAuthenticated && (to.path === '/login' || to.path === '/register' || to.path === '/')) {
  const defaultRoute = auth.currentUser?.role === 'admin' ? '/admin' : '/forum'
  next(defaultRoute)
  return
}
```

## 🎯 数据库存储

### Forum 数据已集成 Firestore ✅

Mental Health Forum 的所有内容都已经自动存储到 Firebase Firestore 数据库中：

#### 📊 Firestore 集合结构

1. **`users` 集合** - 存储用户信息
```javascript
{
  uid: "user-unique-id",
  email: "user@example.com",
  username: "testuser",
  role: "user" | "admin",
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

2. **`posts` 集合** - 存储论坛帖子
```javascript
{
  id: "auto-generated-id",
  title: "帖子标题",
  summary: "帖子内容",
  author: "用户名",
  authorId: "user-uid",
  ratings: [
    { user: "username", userId: "uid", score: 4 }
  ],
  timestamp: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### ✅ 实时数据同步

- **创建帖子**: 自动保存到 Firestore
- **评分**: 实时更新到 Firestore
- **多设备同步**: 在不同浏览器/设备打开应用，数据实时同步

#### 📍 在 Firebase Console 查看数据

1. 访问 [Firestore Database](https://console.firebase.google.com/project/fit5032-youthwell-project/firestore)
2. 查看集合:
   - `users` - 所有注册用户
   - `posts` - 所有论坛帖子

## 🔍 验证清单

- [ ] User 登录后跳转到 Forum
- [ ] Admin 登录后跳转到 Admin Dashboard
- [ ] User 无法访问 /admin
- [ ] Admin 可以访问所有页面
- [ ] 已登录用户访问 /login 自动重定向
- [ ] 未登录用户访问受保护页面重定向到登录
- [ ] 登录页的 redirect 参数正常工作
- [ ] Forum 帖子自动保存到 Firestore
- [ ] 评分实时更新到数据库
- [ ] 在 Firebase Console 能看到数据

---

**所有路由逻辑已优化完成！** 现在可以测试不同角色的登录体验。
