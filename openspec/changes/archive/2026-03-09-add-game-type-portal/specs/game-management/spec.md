## ADDED Requirements

### Requirement: 游戏类型支持

系统 SHALL 在数据模型层面支持游戏类型的概念，为后续类型特定功能奠定基础。

#### Scenario: 创建类型化游戏
- **WHEN** 用户调用 `/api/game/create?type={gameType}`
- **THEN** 系统使用 gameType 参数（2d-strategy、2d-metroidvania、2d-rpg、3d-shooter）创建新游戏

#### Scenario: 游戏数据模型
- **WHEN** 系统创建游戏对象时
- **THEN** 游戏对象包含字段：
  - id: 唯一标识
  - name: 游戏名称
  - type: 游戏类型（枚举值）
  - description: 游戏描述
  - thumbnailUrl: 缩略图
  - metadata: JSON 对象（存储类型特定配置）
  - createdAt: 创建时间
  - updatedAt: 更新时间

#### Scenario: 游戏列表筛选
- **WHEN** 用户调用 `/api/game/list?type={gameType}`
- **THEN** 系统返回特定类型的游戏列表

### Requirement: 扩展游戏 API

系统 SHALL 提供类型感知的游戏 API，支持新的游戏类型工作流。

#### Scenario: 创建新游戏 API
- **WHEN** 用户调用 `POST /api/game/create`，请求体：
  ```json
  {
    "name": "My Strategy Game",
    "type": "2d-strategy",
    "description": "A grid-based strategy game"
  }
  ```
- **THEN** 系统返回：
  ```json
  {
    "id": "game_abc123",
    "name": "My Strategy Game",
    "type": "2d-strategy",
    "description": "A grid-based strategy game",
    "metadata": {},
    "createdAt": 1740491400000,
    "updatedAt": 1740491400000
  }
  ```

#### Scenario: 获取游戏详情
- **WHEN** 用户调用 `GET /api/game/{gameId}`
- **THEN** 系统返回游戏对象及其类型信息

#### Scenario: 获取用户游戏列表
- **WHEN** 用户调用 `GET /api/game/list`
- **THEN** 系统返回用户所有游戏的列表，分组按类型

#### Scenario: 保存游戏进度
- **WHEN** 用户在编辑器中修改场景并调用 `POST /api/game/{gameId}/save`
- **THEN** 系统保存游戏及其所有场景数据

### Requirement: 类型元数据管理

系统 SHALL 为每种游戏类型支持定制化的元数据存储和检索。

#### Scenario: 存储类型特定配置
- **WHEN** 用户在 2D 策略编辑器中配置网格大小为 64 像素，并保存游戏
- **THEN** 系统将配置存储在游戏的 metadata 字段中：
  ```json
  {
    "gridSize": 64,
    "gridEnabled": true
  }
  ```

#### Scenario: 加载类型特定配置
- **WHEN** 用户打开已有的 2D 策略游戏
- **THEN** 编辑器加载 metadata 并应用配置（网格大小、对齐选项等）

#### Scenario: 类型 metadata 模式验证
- **WHEN** 系统保存游戏 metadata
- **THEN** 验证 metadata 符合该类型的模式（例如 2d-strategy 类型必须有 gridSize 字段）

### Requirement: 场景与游戏关联

系统 SHALL 确保场景正确关联到其父游戏，并支持按游戏类型检索场景。

#### Scenario: 创建场景时指定游戏类型
- **WHEN** 用户在 2D RPG 编辑器中创建新场景
- **THEN** 系统自动将场景关联到当前游戏，并标记场景类型为 "2d-rpg"

#### Scenario: 场景列表筛选
- **WHEN** 用户调用 `GET /api/game/{gameId}/scenes`
- **THEN** 系统返回该游戏下的所有场景，每个场景包含类型标记

#### Scenario: 跨编辑器场景兼容性
- **WHEN** 用户打开 2D 策略游戏中的场景
- **THEN** 系统验证场景数据与编辑器类型兼容性（例如不加载 3D 对象）

