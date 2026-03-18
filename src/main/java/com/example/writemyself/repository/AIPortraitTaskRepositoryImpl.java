package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitTaskEntity;
import com.example.writemyself.mapper.AIPortraitTaskMapper;
import com.example.writemyself.model.AIPortraitTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI肖像任务仓储实现
 * 使用MyBatis访问数据库
 */
@Repository
@Transactional
public class AIPortraitTaskRepositoryImpl implements AIPortraitTaskRepository {

    @Autowired
    private AIPortraitTaskMapper aiPortraitTaskMapper;

    /**
     * 保存或更新任务
     */
    @Override
    public void save(AIPortraitTask task) {
        AIPortraitTaskEntity taskEntity = convertToEntity(task);

        if (task.getId() == null) {
            // 插入新任务
            taskEntity.setCreatedAt(LocalDateTime.now());
            taskEntity.setUpdatedAt(LocalDateTime.now());
            aiPortraitTaskMapper.insert(taskEntity);
            task.setId(taskEntity.getId());
        } else {
            // 更新现有任务
            taskEntity.setUpdatedAt(LocalDateTime.now());
            aiPortraitTaskMapper.update(taskEntity);
        }
    }

    /**
     * 根据 ID 查询任务
     */
    @Override
    public AIPortraitTask findById(Long id) {
        AIPortraitTaskEntity taskEntity = aiPortraitTaskMapper.selectById(id);
        if (taskEntity == null) {
            return null;
        }
        return convertToModel(taskEntity);
    }

    /**
     * 根据任务ID查找任务
     */
    @Override
    public AIPortraitTask findByTaskId(String taskId) {
        AIPortraitTaskEntity taskEntity = aiPortraitTaskMapper.selectByTaskId(taskId);
        if (taskEntity == null) {
            return null;
        }
        return convertToModel(taskEntity);
    }

    /**
     * 根据生成记录ID查找任务
     */
    @Override
    public AIPortraitTask findByGenerationId(Long generationId) {
        AIPortraitTaskEntity taskEntity = aiPortraitTaskMapper.selectByGenerationId(generationId);
        if (taskEntity == null) {
            return null;
        }
        return convertToModel(taskEntity);
    }

    /**
     * 获取所有任务
     */
    @Override
    public List<AIPortraitTask> findAll() {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.selectAll();
        return convertToModelList(taskEntities);
    }

    /**
     * 根据状态查找任务
     */
    @Override
    public List<AIPortraitTask> findByStatus(String status) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.selectByStatus(status);
        return convertToModelList(taskEntities);
    }

    /**
     * 根据状态查找任务（按创建时间升序）
     */
    @Override
    public List<AIPortraitTask> findByStatusOrderByCreatedAtAsc(String status) {
        // 注意：selectByStatus已经按创建时间升序排序
        return findByStatus(status);
    }

    /**
     * 根据状态和重试次数查找任务
     */
    @Override
    public List<AIPortraitTask> findByStatusAndRetryCountLessThan(String status, Integer retryCount) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.selectByStatusAndRetryCountLessThan(status, retryCount);
        return convertToModelList(taskEntities);
    }

    /**
     * 删除任务
     */
    @Override
    public void delete(Long id) {
        aiPortraitTaskMapper.deleteById(id);
    }

    /**
     * 删除所有任务（仅用于测试）
     */
    @Override
    public void deleteAll() {
        // 注意：这个方法应该只在测试环境中使用
        // 实际生产环境中应该禁用或限制使用
        List<AIPortraitTaskEntity> allTasks = aiPortraitTaskMapper.selectAll();
        List<Long> ids = new ArrayList<>();
        for (AIPortraitTaskEntity task : allTasks) {
            ids.add(task.getId());
        }
        if (!ids.isEmpty()) {
            aiPortraitTaskMapper.batchDelete(ids);
        }
    }

    /**
     * 获取任务数量
     */
    @Override
    public long count() {
        return aiPortraitTaskMapper.count();
    }

    /**
     * 根据状态获取任务数量
     */
    @Override
    public long countByStatus(String status) {
        return aiPortraitTaskMapper.countByStatus(status);
    }

    /**
     * 检查任务是否存在
     */
    @Override
    public boolean existsById(Long id) {
        return aiPortraitTaskMapper.existsById(id);
    }

    /**
     * 检查任务ID是否存在
     */
    @Override
    public boolean existsByTaskId(String taskId) {
        return aiPortraitTaskMapper.existsByTaskId(taskId);
    }

    /**
     * 分页查询任务
     */
    @Override
    public List<AIPortraitTask> findByPage(int page, int size) {
        int offset = (page - 1) * size;
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.selectByPage(offset, size);
        return convertToModelList(taskEntities);
    }

    /**
     * 条件查询任务
     */
    @Override
    public List<AIPortraitTask> findByCondition(Map<String, Object> condition) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.selectByCondition(condition);
        return convertToModelList(taskEntities);
    }

    /**
     * 搜索任务
     */
    @Override
    public List<AIPortraitTask> search(String keyword) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.search(keyword);
        return convertToModelList(taskEntities);
    }

    /**
     * 获取最近创建的任务
     */
    @Override
    public List<AIPortraitTask> getRecentTasks(int limit) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.getRecentTasks(limit);
        return convertToModelList(taskEntities);
    }

    /**
     * 批量保存任务
     */
    @Override
    public void batchSave(List<AIPortraitTask> tasks) {
        List<AIPortraitTaskEntity> taskEntities = new ArrayList<>();
        for (AIPortraitTask task : tasks) {
            taskEntities.add(convertToEntity(task));
        }
        aiPortraitTaskMapper.batchInsert(taskEntities);
    }

    /**
     * 批量更新任务
     */
    @Override
    public void batchUpdate(List<AIPortraitTask> tasks) {
        List<AIPortraitTaskEntity> taskEntities = new ArrayList<>();
        for (AIPortraitTask task : tasks) {
            taskEntities.add(convertToEntity(task));
        }
        aiPortraitTaskMapper.batchUpdate(taskEntities);
    }

    /**
     * 批量删除任务
     */
    @Override
    public void batchDelete(List<Long> ids) {
        aiPortraitTaskMapper.batchDelete(ids);
    }

    /**
     * 获取任务统计信息
     */
    @Override
    public Map<String, Object> getStatistics() {
        return aiPortraitTaskMapper.getStatistics();
    }

    /**
     * 获取状态统计信息
     */
    @Override
    public Map<String, Object> getStatusStats() {
        return aiPortraitTaskMapper.getStatusStats();
    }

    /**
     * 更新任务状态
     */
    @Override
    public void updateTaskStatus(String taskId, String status, Integer progress, LocalDateTime updatedAt) {
        aiPortraitTaskMapper.updateTaskStatus(taskId, status, progress, updatedAt);
    }

    /**
     * 更新任务完成状态
     */
    @Override
    public void updateTaskCompletion(String taskId, String status, LocalDateTime completedAt, LocalDateTime updatedAt) {
        aiPortraitTaskMapper.updateTaskCompletion(taskId, status, completedAt, updatedAt);
    }

    /**
     * 更新任务开始时间
     */
    @Override
    public void updateTaskStart(String taskId, LocalDateTime startedAt, LocalDateTime updatedAt) {
        aiPortraitTaskMapper.updateTaskStart(taskId, startedAt, updatedAt);
    }

    /**
     * 增加重试次数
     */
    @Override
    public void incrementRetryCount(String taskId) {
        aiPortraitTaskMapper.incrementRetryCount(taskId);
    }

    /**
     * 重置重试次数
     */
    @Override
    public void resetRetryCount(String taskId) {
        aiPortraitTaskMapper.resetRetryCount(taskId);
    }

    /**
     * 批量更新任务状态
     */
    @Override
    public void batchUpdateStatus(List<String> taskIds, String status) {
        aiPortraitTaskMapper.batchUpdateStatus(taskIds, status);
    }

    /**
     * 获取待处理任务（用于任务调度）
     */
    @Override
    public List<AIPortraitTask> getPendingTasks(int limit) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.getPendingTasks(limit);
        return convertToModelList(taskEntities);
    }

    /**
     * 获取失败但可重试的任务
     */
    @Override
    public List<AIPortraitTask> getRetryableTasks(int limit) {
        List<AIPortraitTaskEntity> taskEntities = aiPortraitTaskMapper.getRetryableTasks(limit);
        return convertToModelList(taskEntities);
    }

    /**
     * 将AIPortraitTask模型转换为AIPortraitTaskEntity实体
     */
    private AIPortraitTaskEntity convertToEntity(AIPortraitTask task) {
        AIPortraitTaskEntity entity = new AIPortraitTaskEntity(task);

        // 处理元数据（JSON格式）
        if (task.getMetadata() != null && !task.getMetadata().isEmpty()) {
            // 这里需要将Map转换为JSON字符串
            // 实际项目中可以使用Jackson或Gson
            // 这里简单实现
            entity.setMetadata(task.getMetadata().toString());
        }

        return entity;
    }

    /**
     * 将AIPortraitTaskEntity实体转换为AIPortraitTask模型
     */
    private AIPortraitTask convertToModel(AIPortraitTaskEntity entity) {
        AIPortraitTask task = entity.toAIPortraitTask();

        // 处理元数据（JSON格式）
        if (entity.getMetadata() != null && !entity.getMetadata().isEmpty()) {
            // 这里需要将JSON字符串转换为Map
            // 实际项目中可以使用Jackson或Gson
            // 这里简单实现，返回空Map
            task.setMetadata(new HashMap<>());
        }

        return task;
    }

    /**
     * 将AIPortraitTaskEntity列表转换为AIPortraitTask模型列表
     */
    private List<AIPortraitTask> convertToModelList(List<AIPortraitTaskEntity> entities) {
        List<AIPortraitTask> tasks = new ArrayList<>();
        for (AIPortraitTaskEntity entity : entities) {
            tasks.add(convertToModel(entity));
        }
        return tasks;
    }
}

