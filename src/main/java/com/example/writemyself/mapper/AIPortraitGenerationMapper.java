package com.example.writemyself.mapper;

import com.example.writemyself.entity.AIPortraitGenerationEntity;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * AI肖像生成记录数据访问Mapper接口
 * 使用MyBatis注解和XML混合模式
 */
@Mapper
@Repository
public interface AIPortraitGenerationMapper {

    /**
     * 根据ID查询生成记录
     */
    @Select("SELECT * FROM ai_portrait_generation WHERE id = #{id}")
    @Results(id = "aiPortraitGenerationResultMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "taskId", column = "task_id"),
            @Result(property = "prompt", column = "prompt"),
            @Result(property = "negativePrompt", column = "negative_prompt"),
            @Result(property = "referenceImageUrl", column = "reference_image_url"),
            @Result(property = "imageStrength", column = "image_strength"),
            @Result(property = "width", column = "width"),
            @Result(property = "height", column = "height"),
            @Result(property = "provider", column = "provider"),
            @Result(property = "modelName", column = "model_name"),
            @Result(property = "modelVersion", column = "model_version"),
            @Result(property = "modelWeight", column = "model_weight"),
            @Result(property = "stylePreset", column = "style_preset"),
            @Result(property = "inferenceSteps", column = "inference_steps"),
            @Result(property = "samplerName", column = "sampler_name"),
            @Result(property = "seed", column = "seed"),
            @Result(property = "generationCount", column = "generation_count"),
            @Result(property = "faceEnhance", column = "face_enhance"),
            @Result(property = "outputFormat", column = "output_format"),
            @Result(property = "generatedImageUrls", column = "generated_image_urls"),
            @Result(property = "status", column = "status"),
            @Result(property = "errorMessage", column = "error_message"),
            @Result(property = "generationTime", column = "generation_time"),
            @Result(property = "queueWaitTime", column = "queue_wait_time"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "completedAt", column = "completed_at"),
            @Result(property = "metadata", column = "metadata")
    })
    AIPortraitGenerationEntity selectById(@Param("id") Long id);

    /**
     * 根据任务ID查询生成记录
     */
    @Select("SELECT * FROM ai_portrait_generation WHERE task_id = #{taskId}")
    @ResultMap("aiPortraitGenerationResultMap")
    AIPortraitGenerationEntity selectByTaskId(@Param("taskId") String taskId);

    /**
     * 查询所有生成记录
     */
    @Select("SELECT * FROM ai_portrait_generation ORDER BY created_at DESC")
    @ResultMap("aiPortraitGenerationResultMap")
    List<AIPortraitGenerationEntity> selectAll();

    /**
     * 根据用户ID查询生成记录
     */
    @Select("SELECT * FROM ai_portrait_generation WHERE user_id = #{userId} ORDER BY created_at DESC")
    @ResultMap("aiPortraitGenerationResultMap")
    List<AIPortraitGenerationEntity> selectByUserId(@Param("userId") Long userId);

    /**
     * 根据状态查询生成记录
     */
    @Select("SELECT * FROM ai_portrait_generation WHERE status = #{status} ORDER BY created_at ASC")
    @ResultMap("aiPortraitGenerationResultMap")
    List<AIPortraitGenerationEntity> selectByStatus(@Param("status") String status);

    /**
     * 插入生成记录
     */
    @Insert("INSERT INTO ai_portrait_generation (user_id, task_id, prompt, negative_prompt, reference_image_url, " +
            "image_strength, width, height, provider, model_name, model_version, model_weight, style_preset, " +
            "inference_steps, sampler_name, seed, generation_count, face_enhance, output_format, generated_image_urls, " +
            "status, error_message, generation_time, queue_wait_time, created_at, updated_at, completed_at, metadata) " +
            "VALUES (#{userId}, #{taskId}, #{prompt}, #{negativePrompt}, #{referenceImageUrl}, " +
            "#{imageStrength}, #{width}, #{height}, #{provider}, #{modelName}, #{modelVersion}, #{modelWeight}, " +
            "#{stylePreset}, #{inferenceSteps}, #{samplerName}, #{seed}, #{generationCount}, #{faceEnhance}, " +
            "#{outputFormat}, #{generatedImageUrls}, #{status}, #{errorMessage}, #{generationTime}, #{queueWaitTime}, " +
            "#{createdAt}, #{updatedAt}, #{completedAt}, #{metadata})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AIPortraitGenerationEntity generation);

    /**
     * 更新生成记录
     */
    @Update("UPDATE ai_portrait_generation SET " +
            "user_id = #{userId}, " +
            "task_id = #{taskId}, " +
            "prompt = #{prompt}, " +
            "negative_prompt = #{negativePrompt}, " +
            "reference_image_url = #{referenceImageUrl}, " +
            "image_strength = #{imageStrength}, " +
            "width = #{width}, " +
            "height = #{height}, " +
            "provider = #{provider}, " +
            "model_name = #{modelName}, " +
            "model_version = #{modelVersion}, " +
            "model_weight = #{modelWeight}, " +
            "style_preset = #{stylePreset}, " +
            "inference_steps = #{inferenceSteps}, " +
            "sampler_name = #{samplerName}, " +
            "seed = #{seed}, " +
            "generation_count = #{generationCount}, " +
            "face_enhance = #{faceEnhance}, " +
            "output_format = #{outputFormat}, " +
            "generated_image_urls = #{generatedImageUrls}, " +
            "status = #{status}, " +
            "error_message = #{errorMessage}, " +
            "generation_time = #{generationTime}, " +
            "queue_wait_time = #{queueWaitTime}, " +
            "updated_at = #{updatedAt}, " +
            "completed_at = #{completedAt}, " +
            "metadata = #{metadata} " +
            "WHERE id = #{id}")
    int update(AIPortraitGenerationEntity generation);

    /**
     * 删除生成记录
     */
    @Delete("DELETE FROM ai_portrait_generation WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    /**
     * 统计生成记录数量
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_generation")
    long count();

    /**
     * 根据用户ID统计生成记录数量
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_generation WHERE user_id = #{userId}")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 检查生成记录是否存在
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_generation WHERE id = #{id}")
    boolean existsById(@Param("id") Long id);

    /**
     * 检查任务ID是否存在
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_generation WHERE task_id = #{taskId}")
    boolean existsByTaskId(@Param("taskId") String taskId);

    /**
     * 分页查询生成记录
     * 使用XML映射实现复杂查询
     */
    List<AIPortraitGenerationEntity> selectByPage(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 条件查询生成记录
     * 使用XML映射实现动态SQL
     */
    List<AIPortraitGenerationEntity> selectByCondition(Map<String, Object> condition);

    /**
     * 批量插入生成记录
     * 使用XML映射实现批量操作
     */
    int batchInsert(List<AIPortraitGenerationEntity> generations);

    /**
     * 批量更新生成记录
     * 使用XML映射实现批量操作
     */
    int batchUpdate(List<AIPortraitGenerationEntity> generations);

    /**
     * 批量删除生成记录
     * 使用XML映射实现批量操作
     */
    int batchDelete(List<Long> ids);

    /**
     * 搜索生成记录（根据提示词或模型名称）
     * 使用XML映射实现全文搜索
     */
    List<AIPortraitGenerationEntity> search(@Param("keyword") String keyword);

    /**
     * 获取生成记录统计信息
     * 使用XML映射实现复杂统计
     */
    Map<String, Object> getStatistics();

    /**
     * 获取用户生成记录统计
     * 使用XML映射实现用户统计
     */
    Map<String, Object> getUserGenerationStats(@Param("userId") Long userId);

    /**
     * 获取最近创建的生成记录
     * 使用XML映射实现排序查询
     */
    List<AIPortraitGenerationEntity> getRecentGenerations(@Param("limit") int limit);

    /**
     * 根据用户ID获取最近的生成记录
     * 使用XML映射实现用户特定查询
     */
    List<AIPortraitGenerationEntity> selectRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 根据条件统计生成记录数量
     * 使用XML映射实现动态统计
     */
    long countByCondition(Map<String, Object> condition);

    /**
     * 删除指定时间之前的生成记录
     * 使用XML映射实现时间范围删除
     */
    int deleteByCreatedAtBefore(@Param("dateTime") java.time.LocalDateTime dateTime);
}

