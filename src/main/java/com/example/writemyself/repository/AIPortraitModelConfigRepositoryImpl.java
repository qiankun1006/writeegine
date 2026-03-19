package com.example.writemyself.repository;

import com.example.writemyself.mapper.AIPortraitModelConfigMapper;
import com.example.writemyself.model.AIPortraitModelConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI肖像模型配置仓储实现
 * 使用MyBatis访问数据库
 */
@Repository
@Transactional
public class AIPortraitModelConfigRepositoryImpl implements AIPortraitModelConfigRepository {

    @Autowired
    private AIPortraitModelConfigMapper aiPortraitModelConfigMapper;

    /**
     * 保存或更新模型配置
     */
    @Override
    public void save(AIPortraitModelConfig config) {
        AIPortraitModelConfig configEntity = convertToEntity(config);

        if (config.getId() == null) {
            // 插入新模型配置
            configEntity.setCreatedAt(LocalDateTime.now());
            configEntity.setUpdatedAt(LocalDateTime.now());
            aiPortraitModelConfigMapper.insert(configEntity);
            config.setId(configEntity.getId());
        } else {
            // 更新现有模型配置
            configEntity.setUpdatedAt(LocalDateTime.now());
            aiPortraitModelConfigMapper.update(configEntity);
        }
    }

    /**
     * 根据 ID 查询模型配置
     */
    @Override
    public Optional<AIPortraitModelConfig> findById(Long id) {
        AIPortraitModelConfig configEntity = aiPortraitModelConfigMapper.selectById(id);
        if (configEntity == null) {
            return null;
        }
        return convertToModel(configEntity);
    }

    /**
     * 根据模型名称查找配置
     */
    @Override
    public Optional<AIPortraitModelConfig> findByModelName(String modelName) {
        AIPortraitModelConfig configEntity = aiPortraitModelConfigMapper.selectByModelName(modelName);
        if (configEntity == null) {
            return null;
        }
        return convertToModel(configEntity);
    }

    /**
     * 获取所有模型配置
     */
    @Override
    public List<AIPortraitModelConfig> findAll() {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.selectAll();
        return convertToModelList(configEntities);
    }

    /**
     * 查找所有活跃的模型配置
     */
    @Override
    public List<AIPortraitModelConfig> findByIsActiveTrue() {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.selectByIsActiveTrue();
        return convertToModelList(configEntities);
    }

    /**
     * 根据提供商查找模型配置
     */
    @Override
    public List<AIPortraitModelConfig> findByProvider(String provider) {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.selectByProvider(provider);
        return convertToModelList(configEntities);
    }

    /**
     * 根据提供商查找活跃的模型配置
     */
    @Override
    public List<AIPortraitModelConfig> findByProviderAndIsActiveTrue(String provider) {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.selectByProviderAndIsActiveTrue(provider);
        return convertToModelList(configEntities);
    }

    /**
     * 删除模型配置
     */
    @Override
    public void delete(Long id) {
        aiPortraitModelConfigMapper.deleteById(id);
    }

    /**
     * 删除所有模型配置（仅用于测试）
     */
    @Override
    public void deleteAll() {
        // 注意：这个方法应该只在测试环境中使用
        // 实际生产环境中应该禁用或限制使用
        List<AIPortraitModelConfig> allConfigs = aiPortraitModelConfigMapper.selectAll();
        List<Long> ids = new ArrayList<>();
        for (AIPortraitModelConfig config : allConfigs) {
            ids.add(config.getId());
        }
        if (!ids.isEmpty()) {
            aiPortraitModelConfigMapper.batchDelete(ids);
        }
    }

    /**
     * 获取模型配置数量
     */
    @Override
    public long count() {
        return aiPortraitModelConfigMapper.count();
    }

    /**
     * 检查模型配置是否存在
     */
    @Override
    public boolean existsById(Long id) {
        return aiPortraitModelConfigMapper.existsById(id);
    }

    /**
     * 检查模型名称是否存在
     */
    @Override
    public boolean existsByModelName(String modelName) {
        return aiPortraitModelConfigMapper.existsByModelName(modelName);
    }

    /**
     * 分页查询模型配置
     */
    @Override
    public List<AIPortraitModelConfig> findByPage(int page, int size) {
        int offset = (page - 1) * size;
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.selectByPage(offset, size);
        return convertToModelList(configEntities);
    }

    /**
     * 条件查询模型配置
     */
    @Override
    public List<AIPortraitModelConfig> findByCondition(Map<String, Object> condition) {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.selectByCondition(condition);
        return convertToModelList(configEntities);
    }

    /**
     * 搜索模型配置
     */
    @Override
    public List<AIPortraitModelConfig> search(String keyword) {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.search(keyword);
        return convertToModelList(configEntities);
    }

    /**
     * 获取最近创建的模型配置
     */
    @Override
    public List<AIPortraitModelConfig> getRecentConfigs(int limit) {
        List<AIPortraitModelConfig> configEntities = aiPortraitModelConfigMapper.getRecentConfigs(limit);
        return convertToModelList(configEntities);
    }

    /**
     * 批量保存模型配置
     */
    @Override
    public void batchSave(List<AIPortraitModelConfig> configs) {
        List<AIPortraitModelConfig> configEntities = new ArrayList<>();
        for (AIPortraitModelConfig config : configs) {
            configEntities.add(convertToEntity(config));
        }
        aiPortraitModelConfigMapper.batchInsert(configEntities);
    }

    /**
     * 批量更新模型配置
     */
    @Override
    public void batchUpdate(List<AIPortraitModelConfig> configs) {
        List<AIPortraitModelConfig> configEntities = new ArrayList<>();
        for (AIPortraitModelConfig config : configs) {
            configEntities.add(convertToEntity(config));
        }
        aiPortraitModelConfigMapper.batchUpdate(configEntities);
    }

    /**
     * 批量删除模型配置
     */
    @Override
    public void batchDelete(List<Long> ids) {
        aiPortraitModelConfigMapper.batchDelete(ids);
    }

    /**
     * 获取模型配置统计信息
     */
    @Override
    public Map<String, Object> getStatistics() {
        return aiPortraitModelConfigMapper.getStatistics();
    }

    /**
     * 根据提供商获取模型配置统计
     */
    @Override
    public Map<String, Object> getProviderStats(String provider) {
        return aiPortraitModelConfigMapper.getProviderStats(provider);
    }

    /**
     * 更新模型配置状态
     */
    @Override
    public void updateStatus(Long id, Boolean isActive) {
        aiPortraitModelConfigMapper.updateStatus(id, isActive);
    }

    /**
     * 批量更新模型配置状态
     */
    @Override
    public void batchUpdateStatus(List<Long> ids, Boolean isActive) {
        aiPortraitModelConfigMapper.batchUpdateStatus(ids, isActive);
    }

    /**
     * 将AIPortraitModelConfig模型转换为AIPortraitModelConfig实体
     */

    /**
     * 将AIPortraitModelConfig实体转换为AIPortraitModelConfig模型
     */

    /**
     * 将AIPortraitModelConfig列表转换为AIPortraitModelConfig模型列表
     */
}

