-- V4: 增强骨骼流水线表 - 添加训练数据沉淀、Token计量、RAG索引字段
-- 关联优化项：training-data-flywheel / token-accounting / rag-index

-- ===== skeleton_pipeline_task 扩展字段 =====
-- 用户反馈 & 训练数据飞轮
ALTER TABLE skeleton_pipeline_task
    ADD COLUMN IF NOT EXISTS user_rating        TINYINT      DEFAULT NULL COMMENT '用户评分 1-5，NULL=未评价',
    ADD COLUMN IF NOT EXISTS user_feedback      VARCHAR(500) DEFAULT NULL COMMENT '用户文字反馈',
    ADD COLUMN IF NOT EXISTS is_training_sample TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否已纳入训练集（0=否，1=是）',
    ADD COLUMN IF NOT EXISTS generation_seed    BIGINT       DEFAULT NULL COMMENT '生成随机种子（用于复现）',
    ADD COLUMN IF NOT EXISTS total_duration_ms  BIGINT       DEFAULT NULL COMMENT '全流水线耗时（毫秒）',
    ADD COLUMN IF NOT EXISTS model_versions     VARCHAR(500) DEFAULT NULL COMMENT '各步骤实际使用的模型版本快照（JSON）';

-- 评分查询索引（供训练数据筛选）
CREATE INDEX IF NOT EXISTS idx_rating ON skeleton_pipeline_task (user_rating);
CREATE INDEX IF NOT EXISTS idx_training_sample ON skeleton_pipeline_task (is_training_sample, user_rating);

-- ===== skeleton_pipeline_step 扩展字段 =====
-- Token 计量（用于成本分析和优化）
ALTER TABLE skeleton_pipeline_step
    ADD COLUMN IF NOT EXISTS input_tokens  INT          DEFAULT NULL COMMENT '本步骤输入 Token 数',
    ADD COLUMN IF NOT EXISTS output_tokens INT          DEFAULT NULL COMMENT '本步骤输出 Token 数',
    ADD COLUMN IF NOT EXISTS model_name    VARCHAR(100) DEFAULT NULL COMMENT '本步骤实际使用的模型名称（如 flux.1-dev、qwen-vl-max 等）';

-- ===== RAG 索引表（新建） =====
-- 基于高质量历史任务构建的相似性检索索引
-- 命中时可跳过 OpenPose 关键点识别 & 骨骼绑定步骤，直接复用历史产物
CREATE TABLE IF NOT EXISTS skeleton_rag_index (
    id               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    source_task_id   VARCHAR(64)  NOT NULL COMMENT '来源任务ID（必须是 SUCCESS 且 user_rating >= 4 的任务）',

    -- 检索维度（精确过滤 + 文本相似度两阶段）
    style            VARCHAR(50)  NOT NULL COMMENT '生成风格',
    pose             VARCHAR(50)  NOT NULL COMMENT '角色姿态',
    template_type    VARCHAR(50)  NOT NULL COMMENT '骨骼模板类型',
    openpose_tmpl    VARCHAR(50)  DEFAULT 'openpose_18' COMMENT 'OpenPose模板类型',
    prompt_summary   VARCHAR(500) DEFAULT NULL COMMENT '提示词摘要（截断为500字，用于文本相似度计算）',

    -- 可复用的中间产物 URL（跳过步骤时直接引用）
    keypoints_json_url  VARCHAR(500) DEFAULT NULL COMMENT '关键点JSON文件URL（供跳过步骤4复用）',
    binding_data_url    VARCHAR(500) DEFAULT NULL COMMENT '骨骼绑定JSON URL（供跳过步骤5复用）',
    layer_decomp_url    VARCHAR(500) DEFAULT NULL COMMENT 'see-through分解结果摘要JSON URL（可选复用）',

    -- 质量与统计
    user_rating      TINYINT      NOT NULL DEFAULT 4 COMMENT '来源任务的用户评分（仅收录>=4分的）',
    hit_count        INT          NOT NULL DEFAULT 0 COMMENT '被复用次数（用于热度排序）',
    last_hit_at      TIMESTAMP    NULL COMMENT '最后一次被命中的时间',

    -- 时间
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_source_task (source_task_id),
    INDEX idx_style_pose_tmpl (style, pose, template_type),
    INDEX idx_rating_hit (user_rating DESC, hit_count DESC),
    FULLTEXT INDEX ft_prompt (prompt_summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='骨骼生成 RAG 索引表 - 基于高质量历史任务的相似度检索';

