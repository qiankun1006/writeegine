# 快速启动指南

## 🚀 5 分钟快速开始

### 步骤 1: 启动应用

```bash
cd /Users/qiankun96/Desktop/meituan/writeengine
mvn clean compile && mvn spring-boot:run
```

等待应用启动完成（约 10-15 秒），看到以下日志时说明启动成功：
```
Tomcat started on port 8083 (http) with context path ''
Started WriteMyselfApplication in X.XXX seconds
```

### 步骤 2: 访问游戏类型选择门户

打开浏览器访问：
```
http://localhost:8083/create-game/unity
```

您应该看到一个漂亮的游戏选择界面，包含 4 张卡片：
- 🗺️ 2D 策略战棋
- 🧛 2D 恶魔城
- 🎭 2D 角色扮演
- 🔫 3D 射击

### 步骤 3: 创建新游戏

1. 点击任何卡片上的"新建游戏"按钮
2. 输入游戏名称（如 "My Strategy Game"）
3. 系统会自动创建游戏并跳转到相应的编辑器

### 步骤 4: 查看编辑器

每个编辑器都有：
- ✅ 左侧层级面板 - 显示场景中的对象
- ✅ 中央画布 - Canvas 2D 或 3D 场景
- ✅ 右侧属性面板 - 编辑对象属性
- ✅ 顶部工具栏 - 编辑工具

---

## 🔌 API 测试

### 创建游戏

```bash
curl -X POST "http://localhost:8083/api/game/create?name=TestGame&type=2d-strategy&description=This%20is%20a%20test%20game"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "game_1234567890_abc12345",
    "name": "TestGame",
    "type": "2d-strategy",
    "description": "This is a test game",
    "metadata": {},
    "createdAt": 1740492345000,
    "updatedAt": 1740492345000
  }
}
```

### 获取游戏列表

```bash
curl "http://localhost:8083/api/game/list"
```

### 按类型获取游戏

```bash
curl "http://localhost:8083/api/game/list?type=2d-strategy"
```

### 获取游戏详情

```bash
curl "http://localhost:8083/api/game/list" | jq '.data[0].id' | xargs -I {} curl "http://localhost:8083/api/game/{}"
```

### 保存游戏

```bash
curl -X POST "http://localhost:8083/api/game/GAME_ID/save" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","metadata":{"gridSize":64}}'
```

---

## 📋 功能测试清单

### 门户页面
- [ ] 访问 `/create-game/unity` 显示 4 张卡片
- [ ] 卡片有正确的图标和描述
- [ ] 悬停卡片时有视觉反馈
- [ ] "新建游戏"按钮可以点击
- [ ] "打开"按钮显示已有游戏列表

### 2D 编辑器（策略战棋）
- [ ] 访问 `/create-game/unity/2d-strategy` 加载编辑器
- [ ] Canvas 显示白色画布
- [ ] 网格显示正确
- [ ] 可以创建新对象
- [ ] 可以选择对象
- [ ] 可以拖拽移动对象
- [ ] 网格对齐功能工作

### 2D 编辑器（恶魔城）
- [ ] 访问 `/create-game/unity/2d-metroidvania` 加载编辑器
- [ ] 编辑器界面与策略编辑器相同

### 2D 编辑器（RPG）
- [ ] 访问 `/create-game/unity/2d-rpg` 加载编辑器
- [ ] 编辑器界面与策略编辑器相同

### 3D 编辑器（射击）
- [ ] 访问 `/create-game/unity/3d-shooter` 加载编辑器
- [ ] Three.js 3D 场景显示

### 游戏 API
- [ ] `POST /api/game/create` - 可以创建游戏
- [ ] `GET /api/game/list` - 返回游戏列表
- [ ] `GET /api/game/{gameId}` - 返回游戏详情
- [ ] `GET /api/game/{gameId}/scenes` - 返回场景列表
- [ ] `POST /api/game/{gameId}/save` - 可以保存游戏
- [ ] `DELETE /api/game/{gameId}` - 可以删除游戏

---

## 🔧 调试技巧

### 查看浏览器控制台

打开浏览器开发者工具 (F12)，查看 Console 标签：
- 查看任何 JavaScript 错误
- 验证 API 调用状态

### 查看网络请求

在 Network 标签中：
- 验证对 `/api/game/` 的请求
- 检查响应数据

### 查看编辑器日志

编辑器会在控制台输出：
```javascript
初始化 2D 策略编辑器，GameID: ...
游戏数据加载成功: ...
```

### 清空本地存储

如果编辑器行为异常，可以清空本地存储：
```javascript
// 在浏览器控制台执行
localStorage.clear();
location.reload();
```

---

## 🐛 常见问题

### Q: 访问门户页面时看到 404 错误
**A**: 确保应用已正确启动。查看 Spring Boot 日志是否有错误。

### Q: 创建游戏后卡在加载页面
**A**: 检查浏览器控制台是否有错误。可能是编辑器 HTML 加载失败。

### Q: 编辑器显示空白
**A**: 确保浏览器支持 Canvas。尝试刷新页面。

### Q: API 返回 500 错误
**A**: 查看服务器日志了解具体错误。确保 UnityService 已正确初始化。

---

## 📊 性能测试

### 测试首屏加载时间

打开浏览器开发者工具 → Performance 标签：
1. 清空缓存
2. 访问 `/create-game/unity/2d-strategy`
3. 记录加载完成时间

**目标**: < 500ms

### 测试内存占用

打开浏览器开发者工具 → Memory 标签：
1. 拍摄堆快照
2. 在编辑器中创建 10+ 对象
3. 再次拍摄堆快照
4. 比较内存占用差异

**目标**: < 5MB 增长

---

## 🔗 路由一览

| URL | 说明 | 状态 |
|-----|------|------|
| `/create-game/unity` | 游戏类型选择门户 | ✅ |
| `/create-game/unity/2d-strategy` | 2D 策略编辑器 | ✅ |
| `/create-game/unity/2d-metroidvania` | 2D 恶魔城编辑器 | ✅ |
| `/create-game/unity/2d-rpg` | 2D RPG 编辑器 | ✅ |
| `/create-game/unity/3d-shooter` | 3D 射击编辑器 | ✅ |
| `/api/game/create` | 创建游戏 API | ✅ |
| `/api/game/list` | 获取游戏列表 API | ✅ |
| `/api/game/{id}` | 获取游戏详情 API | ✅ |
| `/api/game/{id}/save` | 保存游戏 API | ✅ |
| `/api/game/{id}/scenes` | 获取场景列表 API | ✅ |

---

## 📞 获取帮助

### 查看实现进度

```bash
cat openspec/changes/add-game-type-portal/IMPLEMENTATION_PROGRESS.md
```

### 查看设计文档

```bash
cat openspec/changes/add-game-type-portal/design.md
```

### 查看数据库迁移

```bash
cat openspec/changes/add-game-type-portal/DATABASE_MIGRATION.md
```

---

## ✅ 验证清单

在报告任何问题之前，请检查以下项目：

- [ ] 应用正确启动（看到 "Tomcat started on port 8083"）
- [ ] 门户页面可以访问（`/create-game/unity` 返回 HTTP 200）
- [ ] 可以创建新游戏
- [ ] 可以访问编辑器页面
- [ ] 浏览器控制台没有 JavaScript 错误
- [ ] API 调用返回预期的 JSON 响应

---

**现在您可以开始探索游戏类型选择门户了！** 🎮

有任何问题，请参考完整的设计文档或查看实现进度报告。

