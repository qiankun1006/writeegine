-- ============================================
-- 数据库初始化脚本 V1
-- 创建核心表结构
-- ============================================

-- 游戏表
CREATE TABLE IF NOT EXISTS game (
    id VARCHAR(64) NOT NULL COMMENT '游戏唯一标识',
    name VARCHAR(255) NOT NULL COMMENT '游戏名称',
    type VARCHAR(50) COMMENT '游戏类型',
    description TEXT COMMENT '游戏描述',
    thumbnail_url VARCHAR(500) COMMENT '缩略图URL',
    config JSON COMMENT '游戏配置（JSON格式）',
    user_id VARCHAR(64) COMMENT '用户ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    INDEX idx_game_user_id (user_id),
    INDEX idx_game_type (type),
    INDEX idx_game_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏表';

-- AI肖像任务表
CREATE TABLE IF NOT EXISTS ai_portrait_task (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id VARCHAR(64) NOT NULL COMMENT '任务ID',
    generation_id BIGINT NOT NULL COMMENT '生成ID',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '任务状态：PENDING, PROCESSING, SUCCESS, FAILED',
    progress INT DEFAULT 0 COMMENT '进度百分比',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retries INT DEFAULT 3 COMMENT '最大重试次数',
    last_error TEXT COMMENT '最后一次错误信息',
    started_at TIMESTAMP NULL COMMENT '开始时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_id (task_id),
    INDEX idx_generation_id (generation_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI肖像任务表';

-- AI肖像生成记录表
CREATE TABLE IF NOT EXISTS ai_portrait_generation (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    user_id VARCHAR(64) COMMENT '用户ID',
    prompt TEXT NOT NULL COMMENT '生成提示词',
    negative_prompt TEXT COMMENT '负面提示词',
    style VARCHAR(100) COMMENT '风格',
    model VARCHAR(100) COMMENT '模型',
    width INT DEFAULT 512 COMMENT '图片宽度',
    height INT DEFAULT 512 COMMENT '图片高度',
    steps INT DEFAULT 30 COMMENT '步数',
    guidance_scale DECIMAL(5,2) DEFAULT 7.5 COMMENT '引导尺度',
    seed BIGINT COMMENT '随机种子',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING, PROCESSING, SUCCESS, FAILED',
    image_url VARCHAR(500) COMMENT '生成图片URL',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI肖像生成记录表';

-- 用户表（预留）
CREATE TABLE IF NOT EXISTS user (
    id VARCHAR(64) NOT NULL COMMENT '用户ID',
    username VARCHAR(100) NOT NULL COMMENT '用户名',
    email VARCHAR(255) COMMENT '邮箱',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(50) DEFAULT 'STRING' COMMENT '配置类型：STRING, NUMBER, BOOLEAN, JSON',
    description VARCHAR(500) COMMENT '配置描述',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_config_key (config_key),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    user_id VARCHAR(64) COMMENT '用户ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_target VARCHAR(100) COMMENT '操作目标',
    operation_detail TEXT COMMENT '操作详情',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    status VARCHAR(20) DEFAULT 'SUCCESS' COMMENT '操作状态：SUCCESS, FAILED',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 文件存储表
CREATE TABLE IF NOT EXISTS file_storage (
    id VARCHAR(64) NOT NULL COMMENT '文件ID',
    filename VARCHAR(255) NOT NULL COMMENT '文件名',
    original_filename VARCHAR(255) COMMENT '原始文件名',
    file_type VARCHAR(100) COMMENT '文件类型',
    file_size BIGINT COMMENT '文件大小（字节）',
    storage_path VARCHAR(500) NOT NULL COMMENT '存储路径',
    storage_type VARCHAR(50) DEFAULT 'LOCAL' COMMENT '存储类型：LOCAL, OSS, S3',
    url VARCHAR(500) COMMENT '访问URL',
    user_id VARCHAR(64) COMMENT '用户ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_file_type (file_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件存储表';

-- ============================================
-- 创建视图
-- ============================================

-- 游戏统计视图
CREATE OR REPLACE VIEW v_game_statistics AS
SELECT
    type,
    COUNT(*) as game_count,
    COUNT(DISTINCT user_id) as user_count,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created,
    AVG(TIMESTAMPDIFF(DAY, created_at, updated_at)) as avg_update_days
FROM game
GROUP BY type;

-- AI任务统计视图
CREATE OR REPLACE VIEW v_ai_task_statistics AS
SELECT
    DATE(created_at) as task_date,
    status,
    COUNT(*) as task_count,
    AVG(progress) as avg_progress,
    AVG(retry_count) as avg_retries,
    SUM(CASE WHEN last_error IS NOT NULL THEN 1 ELSE 0 END) as error_count
FROM ai_portrait_task
GROUP BY DATE(created_at), status;

-- ============================================
-- 创建存储过程
-- ============================================

-- 清理过期任务存储过程
DELIMITER //
CREATE PROCEDURE sp_cleanup_old_tasks(IN days_to_keep INT)
BEGIN
    DECLARE cutoff_date TIMESTAMP;
    SET cutoff_date = DATE_SUB(NOW(), INTERVAL days_to_keep DAY);

    -- 删除过期的成功任务
    DELETE FROM ai_portrait_task
    WHERE status = 'SUCCESS'
      AND completed_at < cutoff_date;

    -- 删除过期的失败任务（已超过最大重试次数）
    DELETE FROM ai_portrait_task
    WHERE status = 'FAILED'
      AND retry_count >= max_retries
      AND updated_at < cutoff_date;

    SELECT ROW_COUNT() as deleted_count;
END //
DELIMITER ;

-- 更新游戏统计存储过程
DELIMITER //
CREATE PROCEDURE sp_update_game_statistics()
BEGIN
    -- 这里可以添加复杂的统计逻辑
    -- 例如：更新游戏热度、计算用户活跃度等
    SELECT 'Game statistics updated' as result;
END //
DELIMITER ;

-- ============================================
-- 创建触发器
-- ============================================

-- 游戏表更新触发器（记录操作日志）
DELIMITER //
CREATE TRIGGER tr_game_after_insert
AFTER INSERT ON game
FOR EACH ROW
BEGIN
    INSERT INTO operation_log (user_id, operation_type, operation_target, operation_detail)
    VALUES (NEW.user_id, 'GAME_CREATE', 'game', CONCAT('创建游戏: ', NEW.name));
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_game_after_update
AFTER UPDATE ON game
FOR EACH ROW
BEGIN
    INSERT INTO operation_log (user_id, operation_type, operation_target, operation_detail)
    VALUES (NEW.user_id, 'GAME_UPDATE', 'game', CONCAT('更新游戏: ', NEW.name));
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_game_after_delete
AFTER DELETE ON game
FOR EACH ROW
BEGIN
    INSERT INTO operation_log (user_id, operation_type, operation_target, operation_detail)
    VALUES (OLD.user_id, 'GAME_DELETE', 'game', CONCAT('删除游戏: ', OLD.name));
END //
DELIMITER ;

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认系统配置
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('system.version', '1.0.0', 'STRING', '系统版本'),
('ai.max_concurrent_tasks', '10', 'NUMBER', 'AI最大并发任务数'),
('ai.default_timeout_minutes', '30', 'NUMBER', 'AI任务默认超时时间（分钟）'),
('game.max_per_user', '100', 'NUMBER', '每个用户最大游戏数'),
('storage.max_file_size_mb', '50', 'NUMBER', '最大文件大小（MB）'),
('log.retention_days', '90', 'NUMBER', '日志保留天数'),
('task.cleanup_days', '30', 'NUMBER', '任务清理天数')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入示例游戏数据（仅用于演示）
INSERT INTO game (id, name, type, description, user_id) VALUES
('demo_game_1', '策略战棋游戏', '2d-strategy', '一个经典的2D策略战棋游戏', 'demo_user_1'),
('demo_game_2', '恶魔城风格游戏', '2d-metroidvania', '具有恶魔城风格的2D平台游戏', 'demo_user_2'),
('demo_game_3', '角色扮演游戏', '2d-rpg', '一个丰富的2D角色扮演游戏', 'demo_user_1'),
('demo_game_4', '第一人称射击', '3d-shooter', '3D第一人称射击游戏', 'demo_user_3')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 创建索引优化
-- ============================================

-- 为常用查询添加复合索引
CREATE INDEX idx_game_user_type ON game(user_id, type);
CREATE INDEX idx_game_created_updated ON game(created_at, updated_at);
CREATE INDEX idx_ai_task_status_created ON ai_portrait_task(status, created_at);
CREATE INDEX idx_ai_generation_user_status ON ai_portrait_generation(user_id, status);

-- ============================================
-- 注释说明
-- ============================================

-- 表注释更新
ALTER TABLE game COMMENT = '游戏表 - 存储游戏基本信息';
ALTER TABLE ai_portrait_task COMMENT = 'AI肖像任务表 - 管理AI生成任务状态';
ALTER TABLE ai_portrait_generation COMMENT = 'AI肖像生成记录表 - 记录AI生成历史';
ALTER TABLE user COMMENT = '用户表 - 用户基本信息';
ALTER TABLE system_config COMMENT = '系统配置表 - 系统运行时配置';
ALTER TABLE operation_log COMMENT = '操作日志表 - 记录用户操作日志';
ALTER TABLE file_storage COMMENT = '文件存储表 - 管理上传的文件';

-- 完成提示
SELECT 'Database initialization completed successfully!' as message;

