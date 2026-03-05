-- 火山引擎模型配置初始化脚本
-- 添加字节跳动火山引擎 doubao-seedream 系列模型

-- 确保表存在（用于测试环境）
CREATE TABLE IF NOT EXISTS `ai_portrait_model_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',

    -- 模型信息
    `model_name` VARCHAR(100) NOT NULL COMMENT '模型名称',
    `model_type` VARCHAR(50) NOT NULL COMMENT '类型 (BASE/TUNED/FINE_TUNED)',
    `provider` VARCHAR(50) NOT NULL COMMENT '提供商 (VOLCENGINE/ALIYUN/BAIDU)',
    `api_endpoint` VARCHAR(255) NOT NULL COMMENT 'API 端点 URL',
    `api_key` VARCHAR(500) NOT NULL COMMENT 'API Key',

    -- 模型参数
    `default_sampler` VARCHAR(50) COMMENT '默认采样器',
    `max_steps` INT DEFAULT 50 COMMENT '最大推理步数',
    `min_steps` INT DEFAULT 10 COMMENT '最小推理步数',
    `max_image_size` INT DEFAULT 2048 COMMENT '最大图像尺寸 (px)',
    `min_image_size` INT DEFAULT 256 COMMENT '最小图像尺寸 (px)',

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
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 立绘模型配置表';

-- 插入火山引擎模型配置
-- 注意：api_key 字段在实际部署时应从环境变量或配置中心获取

-- 火山引擎 Seedream 5.0 模型
INSERT INTO `ai_portrait_model_config` (
    `model_name`, `model_type`, `provider`, `api_endpoint`, `api_key`,
    `default_sampler`, `max_steps`, `min_steps`, `max_image_size`, `min_image_size`,
    `is_active`, `is_default`, `created_at`
) VALUES (
    'doubao-seedream-5-0-260128', 'BASE', 'VOLCENGINE',
    'https://ark.cn-beijing.volces.com',
    '${VOLCENGINE_API_KEY}',
    'euler', 50, 10, 2048, 256,
    true, false, CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
    `model_type` = 'BASE',
    `provider` = 'VOLCENGINE',
    `api_endpoint` = 'https://ark.cn-beijing.volces.com',
    `default_sampler` = 'euler',
    `max_steps` = 50,
    `min_steps` = 10,
    `max_image_size` = 2048,
    `min_image_size` = 256,
    `is_active` = true,
    `updated_at` = CURRENT_TIMESTAMP;

-- 火山引擎 Seedream 4.0 模型
INSERT INTO `ai_portrait_model_config` (
    `model_name`, `model_type`, `provider`, `api_endpoint`, `api_key`,
    `default_sampler`, `max_steps`, `min_steps`, `max_image_size`, `min_image_size`,
    `is_active`, `is_default`, `created_at`
) VALUES (
    'doubao-seedream-4-0-260128', 'BASE', 'VOLCENGINE',
    'https://ark.cn-beijing.volces.com',
    '${VOLCENGINE_API_KEY}',
    'euler', 40, 10, 2048, 256,
    true, false, CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
    `model_type` = 'BASE',
    `provider` = 'VOLCENGINE',
    `api_endpoint` = 'https://ark.cn-beijing.volces.com',
    `default_sampler` = 'euler',
    `max_steps` = 40,
    `min_steps` = 10,
    `max_image_size` = 2048,
    `min_image_size` = 256,
    `is_active` = true,
    `updated_at` = CURRENT_TIMESTAMP;

-- 更新阿里云模型提供商名称（保持一致性）
UPDATE `ai_portrait_model_config`
SET `provider` = 'ALIYUN'
WHERE `provider` = 'aliyun' OR `provider` = 'ALIYUN';

-- 验证插入结果
SELECT
    `model_name`,
    `provider`,
    `is_active`,
    `created_at`
FROM `ai_portrait_model_config`
WHERE `provider` = 'VOLCENGINE'
ORDER BY `model_name`;

