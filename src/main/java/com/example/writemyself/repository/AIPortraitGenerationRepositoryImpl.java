package com.example.writemyself.repository;

import com.example.writemyself.mapper.AIPortraitGenerationMapper;
import com.example.writemyself.model.AIPortraitGeneration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * AI肖像生成记录仓储实现
 * 使用MyBatis访问数据库
 */
@Repository
@Transactional
public class AIPortraitGenerationRepositoryImpl implements AIPortraitGenerationRepository {

    @Autowired
    private AIPortraitGenerationMapper aiPortraitGenerationMapper;

    /**
     * 保存或更新生成记录
     */
    @Override
    public void save(AIPortraitGeneration generation) {
        if (generation.getId() == null) {
            // 插入新生成记录
            generation.setCreatedAt(LocalDateTime.now());
            generation.setUpdatedAt(LocalDateTime.now());
            aiPortraitGenerationMapper.insert(generation);
        } else {
            // 更新现有生成记录
            generation.setUpdatedAt(LocalDateTime.now());
            aiPortraitGenerationMapper.update(generation);
        }
    }

    /**
     * 根据 ID 查询生成记录
     */
    @Override
    public Optional<AIPortraitGeneration> findById(Long id) {
        return Optional.ofNullable(aiPortraitGenerationMapper.selectById(id));
    }

    /**
     * 根据任务ID查找生成记录
     */
    @Override
    public Optional<AIPortraitGeneration> findByTaskId(String taskId) {
        return Optional.ofNullable(aiPortraitGenerationMapper.selectByTaskId(taskId));
    }

    /**
     * 获取所有生成记录
     */
    @Override
    public List<AIPortraitGeneration> findAll() {
        return aiPortraitGenerationMapper.selectAll();
    }

    /**
     * 根据用户ID查找生成记录
     */
    @Override
    public List<AIPortraitGeneration> findByUserId(Long userId) {
        return aiPortraitGenerationMapper.selectByUserId(userId);
    }

    /**
     * 根据用户ID查找生成记录（按创建时间降序）
     */
    @Override
    public List<AIPortraitGeneration> findByUserIdOrderByCreatedAtDesc(Long userId) {
        // 注意：selectByUserId已经按创建时间降序排序
        return findByUserId(userId);
    }

    /**
     * 根据状态查找生成记录
     */
    @Override
    public List<AIPortraitGeneration> findByStatus(String status) {
        return aiPortraitGenerationMapper.selectByStatus(status);
    }

    /**
     * 根据状态查找生成记录（按创建时间升序）
     */
    @Override
    public List<AIPortraitGeneration> findByStatusOrderByCreatedAtAsc(String status) {
        // 注意：selectByStatus已经按创建时间升序排序
        return findByStatus(status);
    }

    /**
     * 删除生成记录
     */
    @Override
    public void delete(Long id) {
        aiPortraitGenerationMapper.deleteById(id);
    }

    /**
     * 删除所有生成记录（仅用于测试）
     */
    @Override
    public void deleteAll() {
        // 注意：这个方法应该只在测试环境中使用
        // 实际生产环境中应该禁用或限制使用
        List<AIPortraitGeneration> allGenerations = aiPortraitGenerationMapper.selectAll();
        List<Long> ids = new ArrayList<>();
        for (AIPortraitGeneration generation : allGenerations) {
            ids.add(generation.getId());
        }
        if (!ids.isEmpty()) {
            aiPortraitGenerationMapper.batchDelete(ids);
        }
    }

    /**
     * 获取生成记录数量
     */
    @Override
    public long count() {
        return aiPortraitGenerationMapper.count();
    }

    /**
     * 根据用户ID获取生成记录数量
     */
    @Override
    public long countByUserId(Long userId) {
        return aiPortraitGenerationMapper.countByUserId(userId);
    }

    /**
     * 检查生成记录是否存在
     */
    @Override
    public boolean existsById(Long id) {
        return aiPortraitGenerationMapper.existsById(id);
    }

    /**
     * 检查任务ID是否存在
     */
    @Override
    public boolean existsByTaskId(String taskId) {
        return aiPortraitGenerationMapper.existsByTaskId(taskId);
    }

    /**
     * 分页查询生成记录
     */
    @Override
    public List<AIPortraitGeneration> findByPage(int page, int size) {
        int offset = (page - 1) * size;
        List<AIPortraitGeneration> generationEntities = aiPortraitGenerationMapper.selectByPage(offset, size);
        return generationEntities;
    }

    /**
     * 条件查询生成记录
     */
    @Override
    public List<AIPortraitGeneration> findByCondition(Map<String, Object> condition) {
        List<AIPortraitGeneration> generationEntities = aiPortraitGenerationMapper.selectByCondition(condition);
        return generationEntities;
    }

    /**
     * 搜索生成记录
     */
    @Override
    public List<AIPortraitGeneration> search(String keyword) {
        List<AIPortraitGeneration> generationEntities = aiPortraitGenerationMapper.search(keyword);
        return generationEntities;
    }

    /**
     * 获取最近创建的生成记录
     */
    @Override
    public List<AIPortraitGeneration> getRecentGenerations(int limit) {
        List<AIPortraitGeneration> generationEntities = aiPortraitGenerationMapper.getRecentGenerations(limit);
        return generationEntities;
    }

    /**
     * 批量保存生成记录
     */
    @Override
    public void batchSave(List<AIPortraitGeneration> generations) {
        aiPortraitGenerationMapper.batchInsert(generations);
    }

    /**
     * 批量更新生成记录
     */
    @Override
    public void batchUpdate(List<AIPortraitGeneration> generations) {
        aiPortraitGenerationMapper.batchUpdate(generations);
    }

    /**
     * 批量删除生成记录
     */
    @Override
    public void batchDelete(List<Long> ids) {
        aiPortraitGenerationMapper.batchDelete(ids);
    }

    /**
     * 获取生成记录统计信息
     */
    @Override
    public Map<String, Object> getStatistics() {
        return aiPortraitGenerationMapper.getStatistics();
    }

    /**
     * 获取用户生成记录统计
     */
    @Override
    public Map<String, Object> getUserGenerationStats(Long userId) {
        return aiPortraitGenerationMapper.getUserGenerationStats(userId);
    }

    /**
     * 查找用户最近的生成记录（限制数量）
     */
    @Override
    public List<AIPortraitGeneration> findRecentByUserId(Long userId, int limit) {
        return aiPortraitGenerationMapper.selectRecentByUserId(userId, limit);
    }

    /**
     * 删除指定时间之前的生成记录
     */
    @Override
    public void deleteByCreatedAtBefore(LocalDateTime dateTime) {
        aiPortraitGenerationMapper.deleteByCreatedAtBefore(dateTime);
    }

}

