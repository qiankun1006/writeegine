package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitGenerationEntity;
import com.example.writemyself.mapper.AIPortraitGenerationMapper;
import com.example.writemyself.model.AIPortraitGeneration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        AIPortraitGenerationEntity generationEntity = convertToEntity(generation);

        if (generation.getId() == null) {
            // 插入新生成记录
            generationEntity.setCreatedAt(LocalDateTime.now());
            generationEntity.setUpdatedAt(LocalDateTime.now());
            aiPortraitGenerationMapper.insert(generationEntity);
            generation.setId(generationEntity.getId());
        } else {
            // 更新现有生成记录
            generationEntity.setUpdatedAt(LocalDateTime.now());
            aiPortraitGenerationMapper.update(generationEntity);
        }
    }

    /**
     * 根据 ID 查询生成记录
     */
    @Override
    public AIPortraitGeneration findById(Long id) {
        AIPortraitGenerationEntity generationEntity = aiPortraitGenerationMapper.selectById(id);
        if (generationEntity == null) {
            return null;
        }
        return convertToModel(generationEntity);
    }

    /**
     * 根据任务ID查找生成记录
     */
    @Override
    public AIPortraitGeneration findByTaskId(String taskId) {
        AIPortraitGenerationEntity generationEntity = aiPortraitGenerationMapper.selectByTaskId(taskId);
        if (generationEntity == null) {
            return null;
        }
        return convertToModel(generationEntity);
    }

    /**
     * 获取所有生成记录
     */
    @Override
    public List<AIPortraitGeneration> findAll() {
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.selectAll();
        return convertToModelList(generationEntities);
    }

    /**
     * 根据用户ID查找生成记录
     */
    @Override
    public List<AIPortraitGeneration> findByUserId(Long userId) {
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.selectByUserId(userId);
        return convertToModelList(generationEntities);
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
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.selectByStatus(status);
        return convertToModelList(generationEntities);
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
        List<AIPortraitGenerationEntity> allGenerations = aiPortraitGenerationMapper.selectAll();
        List<Long> ids = new ArrayList<>();
        for (AIPortraitGenerationEntity generation : allGenerations) {
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
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.selectByPage(offset, size);
        return convertToModelList(generationEntities);
    }

    /**
     * 条件查询生成记录
     */
    @Override
    public List<AIPortraitGeneration> findByCondition(Map<String, Object> condition) {
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.selectByCondition(condition);
        return convertToModelList(generationEntities);
    }

    /**
     * 搜索生成记录
     */
    @Override
    public List<AIPortraitGeneration> search(String keyword) {
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.search(keyword);
        return convertToModelList(generationEntities);
    }

    /**
     * 获取最近创建的生成记录
     */
    @Override
    public List<AIPortraitGeneration> getRecentGenerations(int limit) {
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.getRecentGenerations(limit);
        return convertToModelList(generationEntities);
    }

    /**
     * 批量保存生成记录
     */
    @Override
    public void batchSave(List<AIPortraitGeneration> generations) {
        List<AIPortraitGenerationEntity> generationEntities = new ArrayList<>();
        for (AIPortraitGeneration generation : generations) {
            generationEntities.add(convertToEntity(generation));
        }
        aiPortraitGenerationMapper.batchInsert(generationEntities);
    }

    /**
     * 批量更新生成记录
     */
    @Override
    public void batchUpdate(List<AIPortraitGeneration> generations) {
        List<AIPortraitGenerationEntity> generationEntities = new ArrayList<>();
        for (AIPortraitGeneration generation : generations) {
            generationEntities.add(convertToEntity(generation));
        }
        aiPortraitGenerationMapper.batchUpdate(generationEntities);
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
        List<AIPortraitGenerationEntity> generationEntities = aiPortraitGenerationMapper.selectRecentByUserId(userId, limit);
        return convertToModelList(generationEntities);
    }

    /**
     * 删除指定时间之前的生成记录
     */
    @Override
    public void deleteByCreatedAtBefore(LocalDateTime dateTime) {
        aiPortraitGenerationMapper.deleteByCreatedAtBefore(dateTime);
    }

    /**
     * 将AIPortraitGeneration模型转换为AIPortraitGenerationEntity实体
     */
    private AIPortraitGenerationEntity convertToEntity(AIPortraitGeneration generation) {
        AIPortraitGenerationEntity entity = new AIPortraitGenerationEntity(generation);

        // 处理元数据（JSON格式）
        if (generation.getMetadata() != null && !generation.getMetadata().isEmpty()) {
            // 这里需要将Map转换为JSON字符串
            // 实际项目中可以使用Jackson或Gson
            // 这里简单实现
            entity.setMetadata(generation.getMetadata().toString());
        }

        return entity;
    }

    /**
     * 将AIPortraitGenerationEntity实体转换为AIPortraitGeneration模型
     */
    private AIPortraitGeneration convertToModel(AIPortraitGenerationEntity entity) {
        AIPortraitGeneration generation = entity.toAIPortraitGeneration();

        // 处理元数据（JSON格式）
        if (entity.getMetadata() != null && !entity.getMetadata().isEmpty()) {
            // 这里需要将JSON字符串转换为Map
            // 实际项目中可以使用Jackson或Gson
            // 这里简单实现，返回空Map
            generation.setMetadata(new HashMap<>());
        }

        return generation;
    }

    /**
     * 将AIPortraitGenerationEntity列表转换为AIPortraitGeneration模型列表
     */
    private List<AIPortraitGeneration> convertToModelList(List<AIPortraitGenerationEntity> entities) {
        List<AIPortraitGeneration> generations = new ArrayList<>();
        for (AIPortraitGenerationEntity entity : entities) {
            generations.add(convertToModel(entity));
        }
        return generations;
    }
}

