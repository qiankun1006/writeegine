-- V3: 增强骨骼素材生成 - 流水线步骤持久化表
-- 关联 enhance-skeleton-pipeline-steps 变更

-- ===== 主任务表 =====
CREATE TABLE IF NOT EXISTS skeleton_pipeline_task (
    id            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id       VARCHAR(64)   NOT NULL COMMENT '任务唯一标识，如 enhanced_skeleton_1710000000000',
    user_id       VARCHAR(64)   COMMENT '用户ID',
    -- 请求参数快照
    style         VARCHAR(50)   COMMENT '生成风格：anime/realistic/chibi/cartoon/pixel',
    template_type VARCHAR(50)   COMMENT '骨骼模板类型',
    pose          VARCHAR(50)   COMMENT '姿态',
    prompt        TEXT          COMMENT '提示词',
    negative_prompt TEXT        COMMENT '负面提示词',
    width         INT           DEFAULT 512  COMMENT '目标宽度',
    height        INT           DEFAULT 512  COMMENT '目标高度',
    ref_image_url VARCHAR(500)  COMMENT '参考图URL（若有）',
    -- 整体状态
    status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                  COMMENT '整体状态：PENDING/PROCESSING/SUCCESS/FAILED',
    progress      INT           DEFAULT 0 COMMENT '整体进度 0-100',
    error_message TEXT          COMMENT '整体错误信息',
    -- 最终结果
    full_image_url           VARCHAR(500) COMMENT '最终完整透明图URL',
    skeleton_json_url        VARCHAR(500) COMMENT '骨骼绑定JSON（通用格式）',
    skeleton_spine_url       VARCHAR(500) COMMENT '骨骼绑定JSON（Spine格式）',
    skeleton_dragonbones_url VARCHAR(500) COMMENT '骨骼绑定JSON（DragonBones格式）',
    parts_json    JSON          COMMENT '各部件URL的JSON映射',
    -- 时间
    started_at    TIMESTAMP     NULL COMMENT '开始处理时间',
    completed_at  TIMESTAMP     NULL COMMENT '完成时间',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_id (task_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='增强骨骼素材生成 - 主任务表';

-- ===== 步骤明细表 =====
CREATE TABLE IF NOT EXISTS skeleton_pipeline_step (
    id               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id          VARCHAR(64)  NOT NULL COMMENT '关联的任务ID',
    step_no          INT          NOT NULL COMMENT '步骤序号 1-8',
    step_name        VARCHAR(100) NOT NULL COMMENT '步骤名称，如：生成T-pose骨骼线图',
    step_key         VARCHAR(50)  NOT NULL
                     COMMENT '步骤唯一键：skeleton_line/controlnet/ip_adapter/flux_generate/bg_remove/sam_segment/binding_data/save_result',
    -- 状态
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                     COMMENT 'PENDING/PROCESSING/SUCCESS/FAILED/SKIPPED',
    progress         INT          DEFAULT 0 COMMENT '步骤内进度 0-100',
    error_message    TEXT         COMMENT '步骤错误信息',
    -- 中间产物（步骤完成后填充）
    output_image_url VARCHAR(500) COMMENT '该步骤输出的图片URL（步骤1/2/4/5适用）',
    output_data_json TEXT         COMMENT '该步骤输出的结构化数据（步骤3/6/7/8适用）',
    output_file_url  VARCHAR(500) COMMENT '该步骤输出的文件URL（步骤7/8适用）',
    -- 时间
    started_at       TIMESTAMP    NULL COMMENT '步骤开始时间',
    completed_at     TIMESTAMP    NULL COMMENT '步骤完成时间',
    duration_ms      BIGINT       COMMENT '步骤耗时（毫秒）',
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_step (task_id, step_no),
    INDEX idx_task_id (task_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='增强骨骼素材生成 - 步骤明细表';

