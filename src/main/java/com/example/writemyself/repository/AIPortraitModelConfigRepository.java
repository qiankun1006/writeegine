package com.example.writemyself.repository;

import com.example.writemyself.model.AIPortraitModelConfig;

import java.util.List;
import java.util.Map;

/**
 * AI肖像模型配置仓储接口
 * 支持内存存储和数据库存储
 */
public interface AIPortraitModelConfigRepository {
    /**
     * 保存或更新模型配置
     */
    void save(AIPortraitModelConfig config);

    /**
     * 根据 ID 查询模型配置
     */
    AIPortraitModelConfig findById(Long id);

    /**
     * 根据模型名称查找配置
     */
    AIPortraitModelConfig findByModelName(String modelName);

    /**
     * 获取所有模型配置
     */
    List<AIPortraitModelConfig> findAll();

    /**
     * 查找所有活跃的模型配置
     */
    List<AIPortraitModelConfig> findByIsActiveTrue();

    /**
     * 根据提供商查找模型配置
     */
    List<AIPortraitModelConfig> findByProvider(String provider);

    /**
     * 根据提供商查找活跃的模型配置
     */
    List<AIPortraitModelConfig> findByProviderAndIsActiveTrue(String provider);

    /**
     * 删除模型配置
     */
    void delete(Long id);

    /**
     * 删除所有模型配置（仅用于测试）
     */
    void deleteAll();

    /**
     * 获取模型配置数量
     */
    long count();

    /**
     * 检查模型配置是否存在
     */
    boolean existsById(Long id);

    /**
     * 检查模型名称是否存在
     */
    boolean existsByModelName(String modelName);

    /**
     * 分页查询模型配置
     */
    List<AIPortraitModelConfig> findByPage(int page, int size);

    /**
     * 条件查询模型配置
     */
    List<AIPortraitModelConfig> findByCondition(Map<String, Object> condition);

    /**
     * 搜索模型配置
     */
    List<AIPortraitModelConfig> search(String keyword);

    /**
     * 获取最近创建的模型配置
     */
    List<AIPortraitModelConfig> getRecentConfigs(int limit);

    /**
     * 批量保存模型配置
     */
    void batchSave(List<AIPortraitModelConfig> configs);

    /**
     * 批量更新模型配置
     */
    void batchUpdate(List<AIPortraitModelConfig> configs);

    /**
     * 批量删除模型配置
     */
    void batchDelete(List<Long> ids);

    /**
     * 获取模型配置统计信息
     */
    Map<String, Object> getStatistics();

    /**
     * 根据提供商获取模型配置统计
     */
    Map<String, Object> getProviderStats(String provider);

    /**
     * 更新模型配置状态
     */
    void updateStatus(Long id, Boolean isActive);

    /**
     * 批量更新模型配置状态
     */
    void batchUpdateStatus(List<Long> ids, Boolean isActive);
}

