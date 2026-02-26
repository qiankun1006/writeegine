# 数据库迁移脚本

## 概述

本文档描述了为支持游戏类型选择门户而需要的数据库迁移步骤。

## 1. 创建 Game 表

```sql
-- 创建游戏表
CREATE TABLE game (
    id VARCHAR(100) PRIMARY KEY COMMENT '游戏唯一标识',
    name VARCHAR(255) NOT NULL COMMENT '游戏名称',
    type VARCHAR(50) NOT NULL COMMENT '游戏类型 (2d-strategy, 2d-metroidvania, 2d-rpg, 3d-shooter, 3d-legacy)',
    description TEXT COMMENT '游戏描述',
    thumbnail_url VARCHAR(500) COMMENT '缩略图 URL',
    metadata JSON COMMENT '游戏元数据 (JSON 格式)',
    created_at BIGINT NOT NULL COMMENT '创建时间 (毫秒)',
    updated_at BIGINT NOT NULL COMMENT '更新时间 (毫秒)',
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏信息表';
```

## 2. 修改 Scene 表（可选）

如果需要建立 Scene 和 Game 的关联关系，可以为 unity_scene 表添加外键：

```sql
-- 为现有 scene 表添加 game_id 列
ALTER TABLE unity_scene ADD COLUMN game_id VARCHAR(100) AFTER id;

-- 添加外键
ALTER TABLE unity_scene
ADD CONSTRAINT fk_scene_game
FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE;

-- 添加索引
CREATE INDEX idx_scene_game_id ON unity_scene(game_id);
```

## 3. 迁移现有数据

为了兼容性，将现有的场景数据标记为 "3d-legacy" 类型的游戏：

```sql
-- 为每个现有场景创建对应的 "3d-legacy" 游戏
INSERT INTO game (id, name, type, description, created_at, updated_at)
SELECT
    CONCAT('game_legacy_', id) as id,
    name,
    '3d-legacy' as type,
    description,
    created_at,
    updated_at
FROM unity_scene
ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at);

-- 更新 scene 表的 game_id 关联
UPDATE unity_scene
SET game_id = CONCAT('game_legacy_', id)
WHERE game_id IS NULL;
```

## 4. 创建用户-游戏关联表（可选）

如果需要支持多用户场景，可以创建用户游戏关联表：

```sql
-- 创建用户-游戏关联表
CREATE TABLE user_game (
    user_id VARCHAR(100) NOT NULL,
    game_id VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner' COMMENT '角色 (owner, editor, viewer)',
    created_at BIGINT NOT NULL,
    PRIMARY KEY (user_id, game_id),
    FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-游戏关联表';
```

## 5. 验证迁移

迁移完成后，可以运行以下查询验证：

```sql
-- 检查 game 表是否创建成功
SELECT COUNT(*) as total_games, type as game_type
FROM game
GROUP BY type;

-- 检查 scene 和 game 的关联
SELECT COUNT(*) as scenes_with_game
FROM unity_scene
WHERE game_id IS NOT NULL;

-- 检查 3d-legacy 游戏数量
SELECT COUNT(*) as legacy_games
FROM game
WHERE type = '3d-legacy';
```

## 6. 回滚策略

如果需要回滚迁移，执行以下步骤：

```sql
-- 删除用户-游戏关联表（如果创建了）
DROP TABLE IF EXISTS user_game;

-- 移除 scene 表的 game_id 外键
ALTER TABLE unity_scene DROP FOREIGN KEY fk_scene_game;

-- 移除 scene 表的 game_id 列
ALTER TABLE unity_scene DROP COLUMN game_id;

-- 删除 game 表
DROP TABLE IF EXISTS game;
```

## 7. 注意事项

- 现在的实现使用**内存存储**而非数据库，所以这个迁移脚本是为了**后续实现**准备的
- 在实际部署前，请确保备份所有重要数据
- 建议在测试环境中先行验证迁移脚本
- 大数据量迁移可能需要分批执行

