-- AI肖像模型配置初始数据
INSERT INTO ai_portrait_model_config (model_name, display_name, provider, is_active, description, supported_styles, max_width, max_height, created_at, updated_at) VALUES
('doubao-seedream-5-0-260128', '豆包梦境V5', 'VOLCENGINE', true, '火山引擎豆包梦境系列模型，适合生成二次元角色立绘', '["anime", "realistic", "cartoon", "cyberpunk"]', 2048, 2048, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('wanx-v1', '通义万相V1', 'ALIYUN', true, '阿里云通义万相模型，支持高质量图像生成', '["anime", "realistic", "oil-painting", "watercolor"]', 2048, 2048, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_portrait_generation_user_id ON ai_portrait_generation(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_portrait_generation_task_id ON ai_portrait_generation(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_portrait_generation_created_at ON ai_portrait_generation(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_portrait_task_task_id ON ai_portrait_task(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_portrait_task_generation_id ON ai_portrait_task(generation_id);

