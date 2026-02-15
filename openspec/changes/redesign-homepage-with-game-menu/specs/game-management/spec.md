# 规格文档：游戏管理功能

## 概述

游戏管理包括用户创建、编辑、删除游戏，以及浏览社区分享的游戏。分为"我的游戏"和"游戏广场"两个模块。

---

## ADDED Requirements

### 需求 1：我的游戏列表展示

#### Requirement
用户应该能查看自己创建的所有游戏，包括游戏的基本信息和操作选项。

#### Scenario: 用户访问"我的游戏"页面
```
Given: 用户已登录，创建了 3 个游戏
When: 用户访问 /my-games
Then:
  - 页面标题为"我的游戏"
  - 显示 3 个游戏项，每个包含：
    - 游戏名称
    - 游戏描述
    - 创建日期
    - 当前状态（草稿/已发布）
    - 操作按钮（编辑、游玩、删除）
  - 游戏项按创建时间倒序排列（最新的在前）
```

#### Scenario: 用户没有创建游戏
```
Given: 用户还没有创建任何游戏
When: 用户访问 /my-games
Then:
  - 显示空状态提示：「还没有创建游戏，[现在就开始]」
  - 「现在就开始」链接指向 /create-game
```

---

### 需求 2：创作游戏流程

#### Requirement
用户应该能通过创作页面创建新游戏，包括输入基本信息和使用编辑器编辑地图。

#### Scenario: 用户创建新游戏
```
Given: 用户访问 /create-game
When: 页面加载完成
Then:
  - 显示游戏信息表单：
    - 游戏名称输入框
    - 游戏描述文本框
  - Tilemap 编辑器正常加载
  - 页面底部显示操作按钮：
    - 保存游戏
    - 发布到广场
    - 取消
```

#### Scenario: 用户保存游戏
```
Given: 用户填写了游戏信息，编辑了地图
When: 用户点击"保存游戏"按钮
Then:
  - 收集表单数据和编辑器中的地图数据
  - 将游戏保存为草稿
  - 显示成功提示
  - 游戏出现在"我的游戏"列表中
  - 游戏状态为"草稿"
```

#### Scenario: 用户发布游戏到广场
```
Given: 用户已保存了游戏
When: 用户点击"发布到广场"按钮
Then:
  - 收集表单数据和编辑器中的地图数据
  - 将游戏发布为已发布状态
  - 显示发布成功提示
  - 游戏出现在"游戏广场"中
  - 其他用户能看到这个游戏
```

---

### 需求 3：编辑现有游戏

#### Requirement
用户应该能编辑已创建的游戏（名称、描述、地图等）。

#### Scenario: 用户编辑游戏
```
Given: 用户在"我的游戏"列表中点击"编辑"按钮
When: 进入编辑页面
Then:
  - 跳转到 /create-game/{gameId}
  - 加载现有游戏的信息
  - 表单字段预填充游戏名称和描述
  - 编辑器加载已保存的地图数据
  - 用户可以修改任何信息
  - 保存按钮更新游戏信息
```

---

### 需求 4：游戏广场展示

#### Requirement
用户应该能浏览社区中已发布的游戏。

#### Scenario: 用户浏览游戏广场
```
Given: 用户访问 /game-plaza
When: 页面加载完成
Then:
  - 显示所有已发布的游戏（网格布局）
  - 每个游戏卡片显示：
    - 游戏缩略图
    - 游戏名称
    - 作者名称
    - 点赞数（❤️）
    - 浏览次数（👁️）
  - 卡片底部有"开始游玩"按钮
  - 页面支持搜索和筛选
```

#### Scenario: 用户搜索游戏
```
Given: 用户在游戏广场
When: 用户输入搜索关键词（例如"冒险"）并回车
Then:
  - 过滤显示名称包含"冒险"的游戏
  - 其他游戏被隐藏
  - 搜索结果实时更新
```

#### Scenario: 用户筛选游戏
```
Given: 用户在游戏广场
When: 用户点击筛选标签（最新/最热）
Then:
  - 游戏列表按对应规则排序
  - 最新：按发布时间倒序
  - 最热：按点赞数降序
```

---

### 需求 5：游戏删除功能

#### Requirement
用户应该能删除自己创建的游戏。

#### Scenario: 用户删除游戏
```
Given: 用户在"我的游戏"列表中
When: 用户点击游戏项的"删除"按钮
Then:
  - 显示确认对话框：「确定要删除这个游戏吗？」
  - 如果用户确认删除
    - 游戏从列表中移除
    - 显示删除成功提示
  - 如果用户取消
    - 对话框关闭
    - 游戏保留在列表中
```

---

### 需求 6：游戏玩法（浏览）

#### Requirement
用户应该能在浏览器中游玩社区的游戏或查看自己创建的游戏地图。

#### Scenario: 用户从广场玩游戏
```
Given: 用户在游戏广场看到一个游戏卡片
When: 用户点击"开始游玩"按钮
Then:
  - 跳转到 /game-plaza/play/{gameId}
  - 加载游戏的 Tilemap 地图显示（只读模式）
  - 显示游戏信息（名称、作者、描述）
  - 显示返回按钮
  - 游戏浏览次数自动加 1
```

#### Scenario: 用户从我的游戏预览游戏
```
Given: 用户在"我的游戏"列表中
When: 用户点击"游玩"按钮
Then:
  - 跳转到预览页面，显示当前游戏的地图
  - 可以选择继续编辑或返回列表
```

---

## MODIFIED Requirements

### 修改 - 现有路由

#### Requirement
原有的 /tilemap-editor 路由应该保留向后兼容，但主要流程应该通过 /create-game 进入。

#### Scenario: 直接访问编辑器
```
Given: 用户直接访问 /tilemap-editor
When: 页面加载
Then:
  - 页面仍然可以正常访问（向后兼容）
  - 编辑器显示为独立工具
  - 或者重定向到 /create-game（需要决定）
```

---

## REMOVED Requirements

### 移除 - 旧的首页示例

#### Requirement
原有首页中与游戏创作无关的内容应该被移除。

---

## 数据模型

### Game Entity
```java
@Entity
public class Game {
    @Id
    private Long id;

    private String name;           // 游戏名称
    private String description;    // 游戏描述
    private Long authorId;         // 作者 ID
    private String status;         // 状态：DRAFT（草稿）/ PUBLISHED（已发布）

    private String mapData;        // 保存的地图数据（JSON）
    private String thumbnail;      // 缩略图 URL

    private Integer likes;         // 点赞数
    private Integer views;         // 浏览次数

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### GameDTO (Data Transfer Object)
```json
{
  "id": 1,
  "name": "森林冒险",
  "description": "一个充满冒险的森林世界",
  "author": "张三",
  "status": "PUBLISHED",
  "thumbnail": "/images/games/1.png",
  "likes": 42,
  "views": 156,
  "createdAt": "2026-02-13T10:00:00Z",
  "updatedAt": "2026-02-13T12:30:00Z"
}
```

---

## HTTP 接口

```
GET  /my-games                        获取用户的游戏列表
GET  /create-game                     显示创作游戏页面（新建）
GET  /create-game/{gameId}            显示编辑游戏页面（编辑）
POST /api/games                       保存/创建游戏
PUT  /api/games/{gameId}              更新游戏
DELETE /api/games/{gameId}            删除游戏

GET  /game-plaza                      显示游戏广场页面
GET  /api/games/published             获取已发布游戏列表
GET  /game-plaza/play/{gameId}        显示游戏预览/玩法页面

POST /api/games/{gameId}/like         点赞游戏
POST /api/games/{gameId}/view         增加浏览次数
```

---

## 相关规格交叉引用

- 关联到 [Homepage Portal](../homepage-portal/spec.md) - 首页入口
- 关联到 [Editor Integration](../editor-integration/spec.md) - 编辑器集成

---

## 验收标准

- ✅ 用户能创建新游戏并保存
- ✅ 用户能编辑已有游戏
- ✅ 用户能删除游戏
- ✅ "我的游戏"列表能正确显示所有用户游戏
- ✅ 空状态提示正确显示
- ✅ "游戏广场"能显示所有已发布的游戏
- ✅ 搜索和筛选功能正常工作
- ✅ 游戏玩法（预览）页面能正确加载和显示地图
- ✅ 点赞和浏览统计功能正常工作

