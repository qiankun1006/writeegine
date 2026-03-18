-- ============================================
-- 数据初始化脚本 V2
-- 插入测试数据和基础配置
-- ============================================

-- 禁用外键检查（确保数据插入顺利）
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 初始化用户数据
-- ============================================

-- 插入测试用户
INSERT INTO user (id, username, email, avatar_url) VALUES
('demo_user_1', 'alice', 'alice@example.com', 'https://example.com/avatars/alice.jpg'),
('demo_user_2', 'bob', 'bob@example.com', 'https://example.com/avatars/bob.jpg'),
('demo_user_3', 'charlie', 'charlie@example.com', 'https://example.com/avatars/charlie.jpg'),
('demo_user_4', 'diana', 'diana@example.com', 'https://example.com/avatars/diana.jpg'),
('system_user', 'system', 'system@example.com', 'https://example.com/avatars/system.jpg')
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    email = VALUES(email),
    avatar_url = VALUES(avatar_url),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 2. 初始化游戏数据
-- ============================================

-- 清空现有游戏数据（仅测试环境）
-- DELETE FROM game WHERE id LIKE 'demo_%';

-- 插入详细的游戏数据
INSERT INTO game (id, name, type, description, thumbnail_url, user_id, config) VALUES
-- 2D策略游戏
('demo_strategy_1', '帝国征服', '2d-strategy',
 '一个宏大的帝国建设与征服游戏，玩家需要管理资源、建设城市、训练军队并征服世界。',
 'https://example.com/games/strategy1.jpg',
 'demo_user_1',
 '{"gridSize": {"width": 20, "height": 20}, "maxPlayers": 4, "victoryConditions": ["conquest", "technology", "diplomacy"], "difficulty": "medium"}'),

('demo_strategy_2', '星际争霸', '2d-strategy',
 '在太空中建立殖民地，发展科技，与其他星际文明竞争或合作。',
 'https://example.com/games/strategy2.jpg',
 'demo_user_2',
 '{"gridSize": {"width": 30, "height": 30}, "maxPlayers": 8, "races": ["human", "alien", "robot"], "resourceTypes": ["minerals", "energy", "research"]}'),

-- 2D恶魔城游戏
('demo_metroidvania_1', '暗影城堡', '2d-metroidvania',
 '探索神秘的城堡，解锁新能力，击败强大的BOSS。',
 'https://example.com/games/metroidvania1.jpg',
 'demo_user_1',
 '{"worldSize": "large", "bossCount": 12, "abilityTypes": ["doubleJump", "dash", "wallJump", "grapple"], "difficulty": "hard"}'),

('demo_metroidvania_2', '时间迷宫', '2d-metroidvania',
 '在时间扭曲的迷宫中冒险，利用时间能力解决谜题。',
 'https://example.com/games/metroidvania2.jpg',
 'demo_user_3',
 '{"worldSize": "medium", "bossCount": 8, "timeMechanics": ["rewind", "slow", "stop", "fastForward"], "puzzleCount": 25}'),

-- 2D RPG游戏
('demo_rpg_1', '勇者传说', '2d-rpg',
 '经典的勇者冒险故事，探索广阔的世界，完成任务，提升角色。',
 'https://example.com/games/rpg1.jpg',
 'demo_user_2',
 '{"worldSize": "huge", "questCount": 50, "characterClasses": ["warrior", "mage", "archer", "priest"], "levelCap": 100}'),

('demo_rpg_2', '魔法学院', '2d-rpg',
 '在魔法学院中学习各种魔法，成为最强大的魔法师。',
 'https://example.com/games/rpg2.jpg',
 'demo_user_4',
 '{"worldSize": "medium", "spellTypes": ["fire", "ice", "lightning", "healing", "summon"], "schools": ["elemental", "divine", "arcane", "dark"]}'),

-- 3D射击游戏
('demo_shooter_1', '未来战争', '3d-shooter',
 '在未来战场中使用高科技武器进行激烈的战斗。',
 'https://example.com/games/shooter1.jpg',
 'demo_user_3',
 '{"gameModes": ["deathmatch", "teamDeathmatch", "captureTheFlag", "bombDefusal"], "weaponTypes": ["assaultRifle", "sniperRifle", "shotgun", "rocketLauncher"], "maxPlayers": 16}'),

('demo_shooter_2', '僵尸末日', '3d-shooter',
 '在僵尸横行的世界中生存，寻找资源，建立防御。',
 'https://example.com/games/shooter2.jpg',
 'demo_user_1',
 '{"gameModes": ["survival", "story", "coop"], "zombieTypes": ["walker", "runner", "tank", "spitter"], "dayNightCycle": true}'),

-- 3D遗留游戏
('demo_legacy_1', '经典编辑器', '3d-legacy',
 '使用原始3D编辑器创建自定义场景和模型。',
 'https://example.com/games/legacy1.jpg',
 'demo_user_4',
 '{"toolset": ["modeling", "texturing", "lighting", "animation"], "exportFormats": ["obj", "fbx", "gltf"], "renderEngine": "legacy"}'),

('demo_legacy_2', '怀旧世界', '3d-legacy',
 '重温经典3D游戏的怀旧体验。',
 'https://example.com/games/legacy2.jpg',
 'demo_user_2',
 '{"graphicsStyle": "retro", "controlScheme": "classic", "soundtrack": "8bit", "resolution": "640x480"}')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    thumbnail_url = VALUES(thumbnail_url),
    user_id = VALUES(user_id),
    config = VALUES(config),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 3. 初始化AI肖像生成记录
-- ============================================

-- 插入AI生成记录
INSERT INTO ai_portrait_generation (user_id, prompt, style, model, status, image_url) VALUES
('demo_user_1', '一个穿着中世纪盔甲的骑士，站在城堡前，阳光明媚', 'fantasy', 'stable-diffusion', 'SUCCESS', 'https://example.com/ai/portrait1.jpg'),
('demo_user_2', '科幻风格的宇航员，在太空站外漂浮，地球在背景中', 'sci-fi', 'midjourney', 'SUCCESS', 'https://example.com/ai/portrait2.jpg'),
('demo_user_3', '日本动漫风格的少女，樱花飘落，校园背景', 'anime', 'novelai', 'PROCESSING', NULL),
('demo_user_4', '写实风格的商业人士，在现代化办公室中', 'realistic', 'dall-e', 'FAILED', NULL),
('demo_user_1', '奇幻风格的精灵弓箭手，在森林中，月光照耀', 'fantasy', 'stable-diffusion', 'SUCCESS', 'https://example.com/ai/portrait3.jpg'),
('demo_user_2', '蒸汽朋克风格的发明家，在工作室中制作机械', 'steampunk', 'midjourney', 'PENDING', NULL)
ON DUPLICATE KEY UPDATE
    prompt = VALUES(prompt),
    style = VALUES(style),
    model = VALUES(model),
    status = VALUES(status),
    image_url = VALUES(image_url),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 4. 初始化AI肖像任务
-- ============================================

-- 插入AI任务记录
INSERT INTO ai_portrait_task (task_id, generation_id, status, progress, last_error) VALUES
('task_001', 1, 'SUCCESS', 100, NULL),
('task_002', 2, 'SUCCESS', 100, NULL),
('task_003', 3, 'PROCESSING', 45, NULL),
('task_004', 4, 'FAILED', 0, '模型调用超时，请重试'),
('task_005', 5, 'SUCCESS', 100, NULL),
('task_006', 6, 'PENDING', 0, NULL),
('task_007', NULL, 'FAILED', 0, '参数验证失败：prompt不能为空'),
('task_008', NULL, 'PENDING', 0, NULL)
ON DUPLICATE KEY UPDATE
    generation_id = VALUES(generation_id),
    status = VALUES(status),
    progress = VALUES(progress),
    last_error = VALUES(last_error),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 5. 初始化系统配置（补充）
-- ============================================

-- 插入更多系统配置
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
-- AI相关配置
('ai.default_model', 'stable-diffusion', 'STRING', '默认AI模型'),
('ai.max_prompt_length', '500', 'NUMBER', '最大提示词长度'),
('ai.min_prompt_length', '10', 'NUMBER', '最小提示词长度'),
('ai.available_styles', 'fantasy,sci-fi,anime,realistic,steampunk', 'STRING', '可用风格列表'),

-- 游戏相关配置
('game.default_type', '2d-strategy', 'STRING', '默认游戏类型'),
('game.max_name_length', '100', 'NUMBER', '游戏名称最大长度'),
('game.max_description_length', '2000', 'NUMBER', '游戏描述最大长度'),
('game.available_types', '2d-strategy,2d-metroidvania,2d-rpg,3d-shooter,3d-legacy', 'STRING', '可用游戏类型'),

-- 用户相关配置
('user.max_games_per_day', '10', 'NUMBER', '用户每天最大创建游戏数'),
('user.default_avatar', 'https://example.com/default-avatar.jpg', 'STRING', '默认用户头像'),
('user.name_min_length', '3', 'NUMBER', '用户名最小长度'),
('user.name_max_length', '50', 'NUMBER', '用户名最大长度'),

-- 系统功能配置
('system.maintenance_mode', 'false', 'BOOLEAN', '系统维护模式'),
('system.registration_enabled', 'true', 'BOOLEAN', '是否开放注册'),
('system.demo_mode', 'true', 'BOOLEAN', '演示模式'),
('system.cache_ttl_minutes', '10', 'NUMBER', '缓存过期时间（分钟）'),

-- 文件上传配置
('upload.max_image_size_mb', '10', 'NUMBER', '最大图片大小（MB）'),
('upload.allowed_image_types', 'jpg,jpeg,png,gif,webp', 'STRING', '允许的图片类型'),
('upload.max_file_size_mb', '100', 'NUMBER', '最大文件大小（MB）'),
('upload.allowed_file_types', 'jpg,jpeg,png,gif,webp,mp4,mp3,pdf,zip', 'STRING', '允许的文件类型')
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value),
    config_type = VALUES(config_type),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 6. 初始化操作日志
-- ============================================

-- 插入操作日志示例
INSERT INTO operation_log (user_id, operation_type, operation_target, operation_detail, ip_address, status) VALUES
('demo_user_1', 'GAME_CREATE', 'game', '创建游戏：帝国征服', '192.168.1.100', 'SUCCESS'),
('demo_user_2', 'GAME_CREATE', 'game', '创建游戏：星际争霸', '192.168.1.101', 'SUCCESS'),
('demo_user_1', 'GAME_UPDATE', 'game', '更新游戏：帝国征服的配置', '192.168.1.100', 'SUCCESS'),
('demo_user_3', 'AI_GENERATE', 'ai_portrait', '生成AI肖像：科幻宇航员', '192.168.1.102', 'SUCCESS'),
('demo_user_4', 'AI_GENERATE', 'ai_portrait', '生成AI肖像：商业人士（失败）', '192.168.1.103', 'FAILED'),
('demo_user_2', 'USER_LOGIN', 'user', '用户登录成功', '192.168.1.101', 'SUCCESS'),
('demo_user_1', 'FILE_UPLOAD', 'file', '上传游戏缩略图：strategy1.jpg', '192.168.1.100', 'SUCCESS'),
('system_user', 'SYSTEM_START', 'system', '系统启动完成', '127.0.0.1', 'SUCCESS')
ON DUPLICATE KEY UPDATE
    operation_detail = VALUES(operation_detail),
    ip_address = VALUES(ip_address),
    status = VALUES(status),
    created_at = CURRENT_TIMESTAMP;

-- ============================================
-- 7. 初始化文件存储记录
-- ============================================

-- 插入文件存储示例
INSERT INTO file_storage (id, filename, original_filename, file_type, file_size, storage_path, url, user_id) VALUES
('file_001', 'strategy1.jpg', 'empire_conquest.jpg', 'image/jpeg', 204800, '/uploads/games/strategy1.jpg', 'https://example.com/uploads/games/strategy1.jpg', 'demo_user_1'),
('file_002', 'metroidvania1.jpg', 'shadow_castle.jpg', 'image/jpeg', 187600, '/uploads/games/metroidvania1.jpg', 'https://example.com/uploads/games/metroidvania1.jpg', 'demo_user_1'),
('file_003', 'portrait1.jpg', 'knight_portrait.jpg', 'image/jpeg', 156300, '/uploads/ai/portrait1.jpg', 'https://example.com/uploads/ai/portrait1.jpg', 'demo_user_1'),
('file_004', 'portrait2.jpg', 'astronaut_portrait.jpg', 'image/jpeg', 198700, '/uploads/ai/portrait2.jpg', 'https://example.com/uploads/ai/portrait2.jpg', 'demo_user_2'),
('file_005', 'avatar_alice.jpg', 'alice_profile.jpg', 'image/jpeg', 123400, '/uploads/avatars/alice.jpg', 'https://example.com/uploads/avatars/alice.jpg', 'demo_user_1')
ON DUPLICATE KEY UPDATE
    filename = VALUES(filename),
    original_filename = VALUES(original_filename),
    file_type = VALUES(file_type),
    file_size = VALUES(file_size),
    storage_path = VALUES(storage_path),
    url = VALUES(url),
    user_id = VALUES(user_id),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 8. 创建测试查询视图
-- ============================================

-- 用户游戏统计视图
CREATE OR REPLACE VIEW v_user_game_stats AS
SELECT
    u.username,
    u.email,
    COUNT(g.id) as total_games,
    GROUP_CONCAT(DISTINCT g.type) as game_types,
    MAX(g.created_at) as last_game_created,
    MIN(g.created_at) as first_game_created
FROM user u
LEFT JOIN game g ON u.id = g.user_id
GROUP BY u.id, u.username, u.email;

-- AI生成成功率视图
CREATE OR REPLACE VIEW v_ai_success_rate AS
SELECT
    DATE(created_at) as generate_date,
    COUNT(*) as total_generations,
    SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_count,
    ROUND(SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM ai_portrait_generation
GROUP BY DATE(created_at)
ORDER BY generate_date DESC;

-- 游戏类型分布视图
CREATE OR REPLACE VIEW v_game_type_distribution AS
SELECT
    type,
    COUNT(*) as game_count,
    COUNT(DISTINCT user_id) as user_count,
    ROUND(AVG(LENGTH(description)), 2) as avg_description_length,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM game
GROUP BY type
ORDER BY game_count DESC;

-- ============================================
-- 9. 创建测试数据验证
-- ============================================

-- 验证数据插入结果
SELECT '用户数据验证' as section, COUNT(*) as count FROM user WHERE username IN ('alice', 'bob', 'charlie', 'diana', 'system')
UNION ALL
SELECT '游戏数据验证', COUNT(*) FROM game WHERE id LIKE 'demo_%'
UNION ALL
SELECT 'AI生成记录验证', COUNT(*) FROM ai_portrait_generation WHERE user_id LIKE 'demo_user_%'
UNION ALL
SELECT 'AI任务验证', COUNT(*) FROM ai_portrait_task WHERE task_id LIKE 'task_%'
UNION ALL
SELECT '系统配置验证', COUNT(*) FROM system_config WHERE config_key LIKE 'ai.%' OR config_key LIKE 'game.%'
UNION ALL
SELECT '操作日志验证', COUNT(*) FROM operation_log WHERE user_id LIKE 'demo_user_%'
UNION ALL
SELECT '文件存储验证', COUNT(*) FROM file_storage WHERE id LIKE 'file_%';

-- ============================================
-- 10. 启用外键检查并完成
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- 完成提示
SELECT 'Data initialization completed successfully!' as message,
       NOW() as completion_time,
       'Total records inserted/updated' as summary,
       (SELECT COUNT(*) FROM user) as user_count,
       (SELECT COUNT(*) FROM game) as game_count,
       (SELECT COUNT(*) FROM ai_portrait_generation) as ai_generation_count,
       (SELECT COUNT(*) FROM ai_portrait_task) as ai_task_count,
       (SELECT COUNT(*) FROM system_config) as config_count,
       (SELECT COUNT(*) FROM operation_log) as log_count,
       (SELECT COUNT(*) FROM file_storage) as file_count;

