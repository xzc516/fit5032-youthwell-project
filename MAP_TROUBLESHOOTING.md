# 🗺️ 地图显示问题故障排除

## 问题：Map View 一片白没有图像

---

## 🔍 诊断步骤

### 步骤1：检查浏览器控制台

1. **打开浏览器开发者工具**
   - 按 `F12` 或右键点击页面选择"检查"
   - 切换到 **Console** 选项卡

2. **查找错误信息**

   应该看到这些日志：
   ```
   ✅ MapBox Token: Present
   ✅ Map Container: <div>...</div>
   ✅ Map initialized successfully
   ✅ Map loaded successfully
   ```

   **如果看到错误：**

   ❌ `MapBox token not configured!`
   - **原因：** Token 未正确配置
   - **解决：** 检查 `src/services/mapService.js` 第13行

   ❌ `Failed to load resource: 401`
   - **原因：** Token 无效
   - **解决：** 重新获取 MapBox Token

   ❌ `Map error: ...`
   - **原因：** 地图加载失败
   - **解决：** 检查网络连接

---

### 步骤2：验证 MapBox Token

**检查 Token：**
```bash
# 打开文件
src/services/mapService.js

# 确认第13行
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibWVyY3VyeTA1MTYi...'

# Token 应该：
✅ 以 'pk.' 开头
✅ 是一长串字符（约100+ 字符）
✅ 没有空格或换行
```

**你的Token：**
```
pk.eyJ1IjoibWVyY3VyeTA1MTYiLCJhIjoiY21nanh3ZW54MG5sejJqbXo3MGplY3RiNiJ9.fD5qndG654WO3dY0V3FCQw
```

---

### 步骤3：检查 CSS 加载

**在浏览器控制台运行：**
```javascript
// 检查 MapBox CSS 是否加载
console.log(document.querySelectorAll('link[href*="mapbox"]'))
```

**应该看到：**
```
NodeList [<link rel="stylesheet" href="...mapbox-gl.css">]
```

**如果没有看到：**
- MapBox CSS 未加载
- 需要检查导入语句

---

### 步骤4：检查地图容器尺寸

**在浏览器控制台运行：**
```javascript
// 查找地图容器
const container = document.querySelector('.map-container')
console.log('Container:', container)
console.log('Width:', container.offsetWidth)
console.log('Height:', container.offsetHeight)
```

**应该看到：**
```
Container: <div class="map-container">
Width: 800+ (取决于窗口大小)
Height: 600
```

**如果 Height 是 0：**
- 容器没有高度
- 地图无法显示

---

### 步骤5：网络连接检查

**在浏览器 Network 选项卡：**

1. 刷新页面（F5）
2. 筛选 `mapbox`
3. 查看请求状态

**应该看到：**
```
✅ streets-v12      200 OK
✅ mapbox-gl.css    200 OK
✅ *.pbf (地图瓦片)  200 OK
```

**如果看到 401/403：**
- Token 无效或过期
- 重新生成 Token

**如果看到超时：**
- 网络连接问题
- 检查防火墙/代理

---

## 🔧 快速修复方案

### 方案1：强制刷新页面
```bash
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

### 方案2：清除浏览器缓存
```bash
1. 按 Ctrl + Shift + Delete
2. 选择"缓存的图像和文件"
3. 点击"清除数据"
4. 刷新页面
```

### 方案3：重新验证 Token
```bash
1. 访问 https://account.mapbox.com/access-tokens/
2. 检查 Token 状态
3. 如果过期，创建新 Token
4. 更新 src/services/mapService.js
5. 保存并刷新页面
```

### 方案4：临时禁用 MapBox，使用列表视图
```bash
如果地图一直无法显示，可以暂时使用服务列表：
- 左侧面板显示所有服务
- 点击服务查看详情
- "Use My Location" 仍然可用
- 距离计算正常
- 导航功能正常
```

---

## 🐛 常见问题

### Q1: 看到灰色背景，但没有地图
**原因：** MapBox 样式加载失败

**解决：**
```javascript
// 检查浏览器控制台
// 查找 'style' 相关错误
// 可能是网络问题
```

### Q2: Token 已配置，但仍然白屏
**原因：** CSS 未正确导入

**解决：**
```bash
# 确认 MapBox CSS 导入
# 在 MapBoxMap.vue 第8行
import 'mapbox-gl/dist/mapbox-gl.css'
```

### Q3: 地图闪烁或不稳定
**原因：** 容器尺寸动态变化

**解决：**
```css
/* 在 MapBoxMap.vue style 中 */
.map-container {
  height: 600px; /* 固定高度 */
}
```

### Q4: Token 显示 "Invalid"
**原因：** Token 复制错误或包含空格

**解决：**
```bash
# 重新复制 Token
# 确保没有空格或换行
# 完整的一行字符串
```

---

## 📋 检查清单

复制以下命令到浏览器控制台，逐个检查：

```javascript
// ===== 检查清单 =====

// 1. MapBox Token
console.log('Token:', window.MAPBOX_TOKEN || 'Not accessible')

// 2. 地图容器
const container = document.querySelector('.map-container')
console.log('Container exists:', !!container)
console.log('Container size:', container?.offsetWidth, 'x', container?.offsetHeight)

// 3. MapBox GL 加载
console.log('mapboxgl loaded:', typeof mapboxgl !== 'undefined')

// 4. CSS 加载
const cssLoaded = Array.from(document.styleSheets).some(sheet =>
  sheet.href && sheet.href.includes('mapbox')
)
console.log('MapBox CSS loaded:', cssLoaded)

// 5. 网络请求
// 查看 Network 选项卡中的 mapbox 请求
```

---

## 🚀 备用方案

如果地图仍然无法显示，使用以下备用方案：

### 选项A：使用静态地图 API
```javascript
// 使用 MapBox Static Images API
const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/
144.9631,-37.8136,12,0/800x600@2x?access_token=${MAPBOX_TOKEN}`
```

### 选项B：使用 Google Maps（如果有账户）
```javascript
// 切换到 Google Maps API
// 需要 Google Maps API Key
```

### 选项C：保持当前列表视图
```
✅ 所有核心功能仍然可用：
- 服务列表显示
- 地理定位
- 距离计算
- 最近服务查找
- 导航路线
- 拨打电话
```

---

## 📞 获取帮助

### MapBox 支持
- 文档：https://docs.mapbox.com/mapbox-gl-js/
- 状态：https://status.mapbox.com/
- 论坛：https://github.com/mapbox/mapbox-gl-js/issues

### 项目相关
1. 检查浏览器控制台错误
2. 查看 Network 选项卡
3. 确认 Token 有效性
4. 尝试上述修复方案

---

## ✅ 成功标志

地图正常显示时，你应该看到：

1. **视觉效果：**
   - 灰色/彩色街道地图
   - 蓝色服务标记（5个）
   - 右上角控制按钮

2. **控制台输出：**
   ```
   MapBox Token: Present
   Map Container: <div>
   Map initialized successfully
   Map loaded successfully
   ```

3. **Network 请求：**
   - streets-v12: 200 OK
   - *.pbf: 200 OK

4. **功能正常：**
   - 可以缩放
   - 可以拖动
   - 点击标记显示弹窗

---

**请按照以上步骤检查，并告诉我控制台显示什么错误信息！** 🔍
