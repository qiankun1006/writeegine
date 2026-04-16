package com.example.writemyself.mapper;

import com.example.writemyself.entity.SkeletonPipelineTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * 增强骨骼素材生成 - 主任务 Mapper
 *
 * 使用 XML 映射（SkeletonPipelineTaskMapper.xml）。
 */
@Mapper
@Repository
public interface SkeletonPipelineTaskMapper {

    /**
     * 插入主任务记录
     */
    int insert(SkeletonPipelineTask task);

    /**
     * 根据 taskId 查询主任务
     */
    SkeletonPipelineTask selectByTaskId(@Param("taskId") String taskId);

    /**
     * 更新任务状态为 PROCESSING，并记录开始时间
     */
    int updateStatusToProcessing(@Param("taskId") String taskId,
                                 @Param("startedAt") LocalDateTime startedAt);

    /**
     * 更新任务状态为 SUCCESS，填充最终产物
     */
    int updateStatusToSuccess(@Param("taskId")                   String taskId,
                              @Param("fullImageUrl")             String fullImageUrl,
                              @Param("skeletonJsonUrl")          String skeletonJsonUrl,
                              @Param("skeletonSpineUrl")         String skeletonSpineUrl,
                              @Param("skeletonDragonbonesUrl")   String skeletonDragonbonesUrl,
                              @Param("partsJson")                String partsJson,
                              @Param("completedAt")              LocalDateTime completedAt);

    /**
     * 更新任务状态为 FAILED，填充错误信息
     */
    int updateStatusToFailed(@Param("taskId")       String taskId,
                             @Param("errorMessage") String errorMessage);

    /**
     * 更新任务整体进度
     */
    int updateProgress(@Param("taskId")   String taskId,
                       @Param("progress") int progress);

    /**
     * 更新用户评分和反馈（训练数据飞轮入口）
     */
    int updateFeedback(@Param("taskId")      String taskId,
                       @Param("userRating")  Integer userRating,
                       @Param("userFeedback") String userFeedback);

    /**
     * 将高质量任务标记为训练集（评分 >= 4 时由定期批处理调用）
     */
    int markAsTrainingSample(@Param("taskId") String taskId);

    /**
     * 更新全流水线总耗时（SUCCESS/FAILED 时回写）
     */
    int updateTotalDuration(@Param("taskId")          String taskId,
                            @Param("totalDurationMs") Long totalDurationMs);
}

