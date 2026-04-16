package com.example.writemyself.mapper;

import com.example.writemyself.entity.SkeletonPipelineStep;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 增强骨骼素材生成 - 步骤明细 Mapper
 *
 * 使用 XML 映射（SkeletonPipelineStepMapper.xml）。
 */
@Mapper
@Repository
public interface SkeletonPipelineStepMapper {

    /**
     * 批量插入8条步骤记录（均为 PENDING）
     */
    int batchInsert(@Param("list") List<SkeletonPipelineStep> steps);

    /**
     * 根据 taskId 查询所有步骤（含中间产物，按步骤序号升序）
     */
    List<SkeletonPipelineStep> selectByTaskId(@Param("taskId") String taskId);

    /**
     * 根据 taskId 查询所有步骤（轻量版：不含中间产物，供频繁轮询）
     */
    List<SkeletonPipelineStep> selectLightByTaskId(@Param("taskId") String taskId);

    /**
     * 更新步骤状态为 PROCESSING，记录开始时间
     */
    int updateStatusToProcessing(@Param("taskId")    String taskId,
                                 @Param("stepNo")    int stepNo,
                                 @Param("startedAt") LocalDateTime startedAt);

    /**
     * 更新步骤状态为 SUCCESS，填充产物
     */
    int updateStatusToSuccess(@Param("taskId")         String taskId,
                              @Param("stepNo")         int stepNo,
                              @Param("outputImageUrl") String outputImageUrl,
                              @Param("outputDataJson") String outputDataJson,
                              @Param("outputFileUrl")  String outputFileUrl,
                              @Param("completedAt")    LocalDateTime completedAt,
                              @Param("durationMs")     Long durationMs);

    /**
     * 更新步骤状态为 FAILED，填充错误信息
     */
    int updateStatusToFailed(@Param("taskId")       String taskId,
                             @Param("stepNo")       int stepNo,
                             @Param("errorMessage") String errorMessage);

    /**
     * 根据 taskId + stepNo 查询单步骤记录（断点续跑判断用）
     */
    SkeletonPipelineStep selectByTaskIdAndStepNo(@Param("taskId") String taskId,
                                                 @Param("stepNo") int stepNo);

    /**
     * 更新步骤的 Token 使用量和模型名称
     */
    int updateTokenUsage(@Param("taskId")       String taskId,
                         @Param("stepNo")       int stepNo,
                         @Param("inputTokens")  Integer inputTokens,
                         @Param("outputTokens") Integer outputTokens,
                         @Param("modelName")    String modelName);
}

