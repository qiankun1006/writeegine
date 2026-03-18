package com.example.writemyself.repository;

import com.example.writemyself.model.AIPortraitGeneration;

import java.util.List;
import java.util.Map;

/**
 * AI肖像生成记录仓储接口
 * 支持内存存储和数据库存储
 */
public interface AIPortraitGenerationRepository {
    /**
     * 保存或更新生成记录
     */
    void save(AIPortraitGeneration generation);

    /**
     * 根据 ID 查询生成记录
     */
    AIPortraitGeneration findById(Long id);

    /**
     * 根据任务ID查找生成记录
     */
    AIPortraitGeneration findByTaskId(String taskId);

    /**
     * 获取所有生成记录
     */
    List<AIPortraitGeneration> findAll();

    /**
     * 根据用户ID查找生成记录
     */
    List<AIPortraitGeneration> findByUserId(Long userId);

    /**
     * 根据用户ID查找生成记录（按创建时间降序）
     */
    List<AIPortraitGeneration> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 根据状态查找生成记录
     */
    List<AIPortraitGeneration> findByStatus(String status);

    /**
     * 根据状态查找生成记录（按创建时间升序）
     */
    List<AIPortraitGeneration> findByStatusOrderByCreatedAtAsc(String status);

    /**
     * 删除生成记录
     */
    void delete(Long id);

    /**
     * 删除所有生成记录（仅用于测试）
     */
    void deleteAll();

    /**
     * 获取生成记录数量
     */
    long count();

    /**
     * 根据用户ID获取生成记录数量
     */
    long countByUserId(Long userId);

    /**
     * 检查生成记录是否存在
     */
    boolean existsById(Long id);

    /**
     * 检查任务ID是否存在
     */
    boolean existsByTaskId(String taskId);

    /**
     * 分页查询生成记录
     */
    List<AIPortraitGeneration> findByPage(int page, int size);

    /**
     * 条件查询生成记录
     */
    List<AIPortraitGeneration> findByCondition(Map<String, Object> condition);

    /**
     * 搜索生成记录
     */
    List<AIPortraitGeneration> search(String keyword);

    /**
     * 获取最近创建的生��记录
     */
    List<AIPortraitGeneration> getRecentGenerations(int limit);

    /**
     * 批量保存生成记录
     */
    void batchSave(List<AIPortraitGeneration> generations);

    /**
     * 批量更新生成记录
     */
    void batchUpdate(List<AIPortraitGeneration> generations);

    /**
     * 批量删除生成记录
     */
    void batchDelete(List<Long> ids);

    /**
     * 获取生成记录统计信息
     */
    Map<String, Object> getStatistics();

    /**
     * 获取用户生成记录统计
     */
    Map<String, Object> getUserGenerationStats(Long userId);

    /**
     * 查找用户最近的生成记录（限制数量）
     */
    List<AIPortraitGeneration> findRecentByUserId(Long userId, int limit);

    /**
     * 删除指定时间之前的生成记录
     */
    void deleteByCreatedAtBefore(java.time.LocalDateTime dateTime);
}

