package com.example.writemyself.mapper;

import com.example.writemyself.entity.AIPortraitModelConfigEntity;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * AI肖像模型配置数据访问Mapper接口
 * 使用MyBatis注解和XML混合模式
 */
@Mapper
@Repository
public interface AIPortraitModelConfigMapper {

    /**
     * 根据ID查询模型配置
     */
    @Select("SELECT * FROM ai_portrait_model_config WHERE id = #{id}")
    @Results(id = "aiPortraitModelConfigResultMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "modelName", column = "model_name"),
            @Result(property = "displayName", column = "display_name"),
            @Result(property = "provider", column = "provider"),
            @Result(property = "endpointUrl", column = "endpoint_url"),
            @Result(property = "isActive", column = "is_active"),
            @Result(property = "description", column = "description"),
            @Result(property = "supportedStyles", column = "supported_styles"),
            @Result(property = "maxWidth", column = "max_width"),
            @Result(property = "maxHeight", column = "max_height"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "metadata", column = "metadata")
    })
    AIPortraitModelConfigEntity selectById(@Param("id") Long id);

    /**
     * 根据模型名称查询模型配置
     */
    @Select("SELECT * FROM ai_portrait_model_config WHERE model_name = #{modelName}")
    @ResultMap("aiPortraitModelConfigResultMap")
    AIPortraitModelConfigEntity selectByModelName(@Param("modelName") String modelName);

    /**
     * 查询所有模型配置
     */
    @Select("SELECT * FROM ai_portrait_model_config ORDER BY created_at DESC")
    @ResultMap("aiPortraitModelConfigResultMap")
    List<AIPortraitModelConfigEntity> selectAll();

    /**
     * 查询所有活跃的模型配置
     */
    @Select("SELECT * FROM ai_portrait_model_config WHERE is_active = true ORDER BY created_at DESC")
    @ResultMap("aiPortraitModelConfigResultMap")
    List<AIPortraitModelConfigEntity> selectByIsActiveTrue();

    /**
     * 根据提供商查询模型配置
     */
    @Select("SELECT * FROM ai_portrait_model_config WHERE provider = #{provider} ORDER BY created_at DESC")
    @ResultMap("aiPortraitModelConfigResultMap")
    List<AIPortraitModelConfigEntity> selectByProvider(@Param("provider") String provider);

    /**
     * 根据提供商查询活跃的模型配置
     */
    @Select("SELECT * FROM ai_portrait_model_config WHERE provider = #{provider} AND is_active = true ORDER BY created_at DESC")
    @ResultMap("aiPortraitModelConfigResultMap")
    List<AIPortraitModelConfigEntity> selectByProviderAndIsActiveTrue(@Param("provider") String provider);

    /**
     * 插入模型配置
     */
    @Insert("INSERT INTO ai_portrait_model_config (model_name, display_name, provider, endpoint_url, is_active, " +
            "description, supported_styles, max_width, max_height, created_at, updated_at, metadata) " +
            "VALUES (#{modelName}, #{displayName}, #{provider}, #{endpointUrl}, #{isActive}, " +
            "#{description}, #{supportedStyles}, #{maxWidth}, #{maxHeight}, #{createdAt}, #{updatedAt}, #{metadata})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AIPortraitModelConfigEntity config);

    /**
     * 更新模型配置
     */
    @Update("UPDATE ai_portrait_model_config SET " +
            "model_name = #{modelName}, " +
            "display_name = #{displayName}, " +
            "provider = #{provider}, " +
            "endpoint_url = #{endpointUrl}, " +
            "is_active = #{isActive}, " +
            "description = #{description}, " +
            "supported_styles = #{supportedStyles}, " +
            "max_width = #{maxWidth}, " +
            "max_height = #{maxHeight}, " +
            "updated_at = #{updatedAt}, " +
            "metadata = #{metadata} " +
            "WHERE id = #{id}")
    int update(AIPortraitModelConfigEntity config);

    /**
     * 删除模型配置
     */
    @Delete("DELETE FROM ai_portrait_model_config WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    /**
     * 统计模型配置数量
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_model_config")
    long count();

    /**
     * 检查模型配置是否存在
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_model_config WHERE id = #{id}")
    boolean existsById(@Param("id") Long id);

    /**
     * 检查模型名称是否存在
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_model_config WHERE model_name = #{modelName}")
    boolean existsByModelName(@Param("modelName") String modelName);

    /**
     * 分页查询模型配置
     * 使用XML映射实现复杂查询
     */
    List<AIPortraitModelConfigEntity> selectByPage(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 条件查询模型配置
     * 使用XML映射实现动态SQL
     */
    List<AIPortraitModelConfigEntity> selectByCondition(Map<String, Object> condition);

    /**
     * 批量插入模型配置
     * 使用XML映射实现批量操作
     */
    int batchInsert(List<AIPortraitModelConfigEntity> configs);

    /**
     * 批量更新模型配置
     * 使用XML映射实现批量操作
     */
    int batchUpdate(List<AIPortraitModelConfigEntity> configs);

    /**
     * 批量删除模型配置
     * 使用XML映射实现批量操作
     */
    int batchDelete(List<Long> ids);

    /**
     * 搜索模型配置（根据模型名称、显示名称或描述）
     * 使用XML映射实现全文搜索
     */
    List<AIPortraitModelConfigEntity> search(@Param("keyword") String keyword);

    /**
     * 获取模型配置统计信息
     * 使用XML映射实现复杂统计
     */
    Map<String, Object> getStatistics();

    /**
     * 根据提供商获取模型配置统计
     * 使用XML映射实现提供商统计
     */
    Map<String, Object> getProviderStats(@Param("provider") String provider);

    /**
     * 获取最近创建的模型配置
     * 使用XML映射实现排序查询
     */
    List<AIPortraitModelConfigEntity> getRecentConfigs(@Param("limit") int limit);

    /**
     * 更新模型配置状态
     * 使用XML映射实现状态更新
     */
    int updateStatus(@Param("id") Long id, @Param("isActive") Boolean isActive);

    /**
     * 批量更新模型配置状态
     * 使用XML映射实现批量状态更新
     */
    int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("isActive") Boolean isActive);

    /**
     * 根据条件统计模型配置数量
     * 使用XML映射实现动态统计
     */
    long countByCondition(Map<String, Object> condition);
}

