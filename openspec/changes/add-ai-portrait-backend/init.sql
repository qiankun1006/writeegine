-- ===========================================
-- AI 立绘生成器后端数据库初始化脚本
-- Java 8 + Spring Boot 2.7 + MySQL 5.7
-- ===========================================

USE writeengine;

-- ==========================================
-- 表 1: ai_portrait_generation (生成记录表)
-- ==========================================

DROP TABLE IF EXISTS `ai_portrait_generation`;

CREATE TABLE `ai_portrait_generation` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    -- 基础信息
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `task_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '异步任务 ID',

    -- 输入参数
    `prompt` TEXT NOT NULL COMMENT '正提示词',
    `negative_prompt` TEXT COMMENT '负提示词',
    `reference_image_url` VARCHAR(255) COMMENT '参考图片 URL',
    `model_weight` DECIMAL(3,2) COMMENT '模型权重 (0-1)',

    -- 模型选择
    `provider` VARCHAR(50) DEFAULT 'aliyun' COMMENT '模型提供商 (aliyun/baidu/tencent)',
    `model_version` VARCHAR(100) DEFAULT 'v1' COMMENT '模型版本',

    -- 尺寸信息
    `width` INT NOT NULL COMMENT '宽度 (px)',
    `height` INT NOT NULL COMMENT '高度 (px)',

    -- 高级参数
    `image_strength` DECIMAL(3,2) COMMENT '图生图强度 (0-1)',
    `generation_count` INT DEFAULT 1 COMMENT '生成数量',
    `sampler_name` VARCHAR(50) COMMENT '采样器 (Euler/DPM++/AutoCFG)',
    `inference_steps` INT DEFAULT 30 COMMENT '迭代步数',
    `style_preset` VARCHAR(50) COMMENT '风格预设',
    `seed` BIGINT DEFAULT -1 COMMENT '种子值 (-1表示随机)',
    `enable_face_fix` BOOLEAN DEFAULT true COMMENT '面部修复',
    `output_format` VARCHAR(10) DEFAULT 'PNG' COMMENT '输出格式',

    -- 输出结果
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态 (PENDING/PROCESSING/SUCCESS/FAILED)',
    `generated_image_urls` TEXT COMMENT '生成图片 URL 列表 (JSON)',
    `error_message` VARCHAR(500) COMMENT '错误信息',

    -- 性能指标
    `generation_time` BIGINT COMMENT '生成耗时 (毫秒)',
    `queue_wait_time` BIGINT COMMENT '队列等待时间 (毫秒)',

    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',

    -- 索引
    KEY `idx_user_id` (`user_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_provider` (`provider`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘生成记录表';

-- ==========================================
-- 表 2: ai_portrait_task (异步任务表)
-- ==========================================

DROP TABLE IF EXISTS `ai_portrait_task`;

CREATE TABLE `ai_portrait_task` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    `task_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '异步任务 ID',
    `generation_id` BIGINT NOT NULL COMMENT '对应的生成记录 ID',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',

    -- 任务状态
    `status` VARCHAR(20) NOT NULL COMMENT '状态 (PENDING/PROCESSING/SUCCESS/FAILED/CANCELLED)',
    `progress` INT DEFAULT 0 COMMENT '进度百分比 (0-100)',

    -- 重试信息
    `retry_count` INT DEFAULT 0 COMMENT '已重试次数',
    `max_retries` INT DEFAULT 3 COMMENT '最大重试次数',
    `last_error` VARCHAR(500) COMMENT '最后的错误信息',

    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `started_at` TIMESTAMP NULL COMMENT '开始处理时间',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',

    -- 索引
    KEY `idx_task_id` (`task_id`),
    KEY `idx_generation_id` (`generation_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),

    -- 外键约束 (可选)
    CONSTRAINT `fk_task_generation` FOREIGN KEY (`generation_id`)
        REFERENCES `ai_portrait_generation` (`id`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘异步任务表';

-- ==========================================
-- 表 3: ai_portrait_model_config (模型配置表)
-- ==========================================

DROP TABLE IF EXISTS `ai_portrait_model_config`;

CREATE TABLE `ai_portrait_model_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    -- 模型信息
    `model_name` VARCHAR(100) NOT NULL COMMENT '模型名称 (wanx-v1/dall-e-3)',
    `model_type` VARCHAR(50) NOT NULL COMMENT '类型 (BASE/TUNED/FINE_TUNED)',
    `provider` VARCHAR(50) NOT NULL COMMENT '提供商 (ALIYUN/BAIDU/TENCENT/CUSTOM)',
    `api_endpoint` VARCHAR(255) NOT NULL COMMENT 'API 端点 URL',
    `api_key` VARCHAR(500) NOT NULL COMMENT 'API Key (加密存储)',

    -- 模型参数
    `default_sampler` VARCHAR(50) COMMENT '默认采样器',
    `max_steps` INT DEFAULT 50 COMMENT '最大推理步数',
    `min_steps` INT DEFAULT 10 COMMENT '最小推理步数',
    `max_image_size` INT DEFAULT 2048 COMMENT '最大图像尺寸 (px)',
    `min_image_size` INT DEFAULT 256 COMMENT '最小图像尺寸 (px)',

    -- 微调参数
    `base_model_version` VARCHAR(50) COMMENT '基础模型版本',
    `tuning_dataset` VARCHAR(255) COMMENT '微调数据集路径',
    `tuning_epochs` INT COMMENT '微调轮数',
    `tuning_learning_rate` DECIMAL(10,6) COMMENT '微调学习率',

    -- 使用统计
    `total_requests` BIGINT DEFAULT 0 COMMENT '总请求数',
    `total_success` BIGINT DEFAULT 0 COMMENT '成功次数',
    `total_failed` BIGINT DEFAULT 0 COMMENT '失败次数',
    `avg_response_time` BIGINT DEFAULT 0 COMMENT '平均响应时间 (ms)',

    -- 配置状态
    `is_active` BOOLEAN DEFAULT true COMMENT '是否启用',
    `is_default` BOOLEAN DEFAULT false COMMENT '是否默认',

    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    KEY `idx_model_name` (`model_name`),
    KEY `idx_provider` (`provider`),
    KEY `idx_is_active` (`is_active`),
    KEY `idx_is_default` (`is_default`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘模型配置表';

-- ==========================================
-- 表 4: ai_portrait_resource_library (资源库表)
-- ==========================================

DROP TABLE IF EXISTS `ai_portrait_resource_library`;

CREATE TABLE `ai_portrait_resource_library` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `generation_id` BIGINT COMMENT '对应的生成记录 ID',

    -- 资源信息
    `name` VARCHAR(255) NOT NULL COMMENT '资源名称',
    `description` TEXT COMMENT '资源描述',
    `category` VARCHAR(50) COMMENT '分类 (anime/realistic/game/etc)',

    -- 图片信息
    `image_url` VARCHAR(255) NOT NULL COMMENT '图片 URL',
    `image_format` VARCHAR(10) COMMENT '图片格式 (PNG/JPG)',
    `image_size` BIGINT COMMENT '图片大小 (字节)',
    `image_width` INT COMMENT '图片宽度',
    `image_height` INT COMMENT '图片高度',

    -- 元数据
    `generation_params` TEXT COMMENT '生成参数 (JSON)',
    `tags` VARCHAR(500) COMMENT '标签 (逗号分隔)',

    -- 统计
    `usage_count` INT DEFAULT 0 COMMENT '使用次数',
    `rating` DECIMAL(2,1) COMMENT '用户评分 (1-5)',

    -- 状态
    `is_public` BOOLEAN DEFAULT false COMMENT '是否公开',
    `is_archived` BOOLEAN DEFAULT false COMMENT '是否已归档',

    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    KEY `idx_user_id` (`user_id`),
    KEY `idx_generation_id` (`generation_id`),
    KEY `idx_category` (`category`),
    KEY `idx_is_public` (`is_public`),
    KEY `idx_created_at` (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘资源库表';

-- ==========================================
-- 表 5: ai_portrait_user_preset (用户预设表)
-- ==========================================

DROP TABLE IF EXISTS `ai_portrait_user_preset`;

CREATE TABLE `ai_portrait_user_preset` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `preset_name` VARCHAR(100) NOT NULL COMMENT '预设名称',

    -- 参数配置
    `prompt_template` TEXT NOT NULL COMMENT '提示词模板',
    `negative_prompt` TEXT COMMENT '负提示词',
    `style_preset` VARCHAR(50) COMMENT '风格预设',

    -- 参数
    `width` INT DEFAULT 1024 COMMENT '默认宽度',
    `height` INT DEFAULT 1024 COMMENT '默认高度',
    `inference_steps` INT DEFAULT 30 COMMENT '推理步数',
    `sampler_name` VARCHAR(50) COMMENT '采样器',
    `seed` BIGINT DEFAULT -1 COMMENT '种子值',

    -- 模型配置
    `preferred_provider` VARCHAR(50) DEFAULT 'aliyun' COMMENT '首选提供商',
    `preferred_model` VARCHAR(100) COMMENT '首选模型',

    -- 状态
    `is_favorite` BOOLEAN DEFAULT false COMMENT '是否收藏',
    `usage_count` INT DEFAULT 0 COMMENT '使用次数',

    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    KEY `idx_user_id` (`user_id`),
    KEY `idx_is_favorite` (`is_favorite`),
    KEY `idx_created_at` (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘用户预设表';

-- ==========================================
-- 表 6: ai_portrait_generation_queue (任务队列表)
-- ==========================================

DROP TABLE IF EXISTS `ai_portrait_generation_queue`;

CREATE TABLE `ai_portrait_generation_queue` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    `task_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '任务 ID',
    `generation_id` BIGINT NOT NULL COMMENT '生成记录 ID',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',

    -- 队列信息
    `queue_status` VARCHAR(20) NOT NULL COMMENT '队列状态 (WAITING/PROCESSING/DONE)',
    `priority` INT DEFAULT 0 COMMENT '优先级 (0-100)',
    `queue_position` INT COMMENT '队列位置',

    -- 模型配置
    `provider` VARCHAR(50) DEFAULT 'aliyun' COMMENT '分配的提供商',
    `model_name` VARCHAR(100) COMMENT '分配的模型',

    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '进入队列时间',
    `started_at` TIMESTAMP NULL COMMENT '开始处理时间',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',
    `wait_time` BIGINT COMMENT '等待时间 (ms)',
    `process_time` BIGINT COMMENT '处理时间 (ms)',

    -- 索引
    KEY `idx_task_id` (`task_id`),
    KEY `idx_generation_id` (`generation_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_queue_status` (`queue_status`),
    KEY `idx_priority` (`priority`),
    KEY `idx_created_at` (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘生成队列表';

-- ==========================================
-- 初始化数据
-- ==========================================

-- 1. 插入默认模型配置
INSERT INTO `ai_portrait_model_config` (
    `model_name`, `model_type`, `provider`, `api_endpoint`, `api_key`,
    `default_sampler`, `max_steps`, `min_steps`, `max_image_size`, `min_image_size`,
    `is_active`, `is_default`, `created_at`
) VALUES (
    'wanx-v1', 'BASE', 'ALIYUN',
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    '${ALIYUN_API_KEY}',
    'euler', 50, 10, 2048, 256,
    true, true, CURRENT_TIMESTAMP
);

INSERT INTO `ai_portrait_model_config` (
    `model_name`, `model_type`, `provider`, `api_endpoint`, `api_key`,
    `default_sampler`, `max_steps`, `min_steps`, `max_image_size`, `min_image_size`,
    `is_active`, `is_default`, `created_at`
) VALUES (
    'wanx-sketch-to-image', 'BASE', 'ALIYUN',
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis',
    '${ALIYUN_API_KEY}',
    'euler', 30, 10, 2048, 256,
    true, false, CURRENT_TIMESTAMP
);

INSERT INTO `ai_portrait_model_config` (
    `model_name`, `model_type`, `provider`, `api_endpoint`, `api_key`,
    `default_sampler`, `max_steps`, `min_steps`, `max_image_size`, `min_image_size`,
    `is_active`, `is_default`, `created_at`
) VALUES (
    'DALL-E-3', 'BASE', 'BAIDU',
    'https://wenxin-api.baidu.com/rpc/2.0/wenxin/stable/image',
    '${BAIDU_API_KEY}',
    'dpm++', 50, 10, 2048, 256,
    true, false, CURRENT_TIMESTAMP
);

-- 2. 创建示例用户预设
INSERT INTO `ai_portrait_user_preset` (
    `user_id`, `preset_name`, `prompt_template`, `negative_prompt`,
    `style_preset`, `width`, `height`, `inference_steps`,
    `sampler_name`, `preferred_provider`, `preferred_model`, `created_at`
) VALUES (
    1, '日系二次元少女',
    '日系二次元风格, 年轻女孩, 长发, 大眼睛, 精致五官, 可爱表情',
    '真人, 低质量, 模糊',
    '日系二次元', 1024, 1024, 30,
    'euler', 'aliyun', 'wanx-v1', CURRENT_TIMESTAMP
);

INSERT INTO `ai_portrait_user_preset` (
    `user_id`, `preset_name`, `prompt_template`, `negative_prompt`,
    `style_preset`, `width`, `height`, `inference_steps`,
    `sampler_name`, `preferred_provider`, `preferred_model`, `created_at`
) VALUES (
    1, '国风写实',
    '中国风, 古装美女, 精致五官, 优雅气质, 油画风格, 4k质量',
    '西方风格, 现代风格, 低质量',
    '国风写实', 1024, 1024, 40,
    'euler', 'aliyun', 'wanx-v1', CURRENT_TIMESTAMP
);

-- ==========================================
-- 验证表创建
-- ==========================================

-- 显示所有表
SHOW TABLES LIKE 'ai_portrait_%';

-- 显示表结构 (可选)
DESCRIBE ai_portrait_generation;

-- 显示初始化数据
SELECT * FROM ai_portrait_model_config;
SELECT * FROM ai_portrait_user_preset;

-- ==========================================
-- 完成
-- ==========================================

COMMIT;

SELECT '✅ 数据库初始化完成！' AS message;

