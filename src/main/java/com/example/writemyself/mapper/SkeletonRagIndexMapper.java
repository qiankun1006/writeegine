package com.example.writemyself.mapper;

import com.example.writemyself.entity.SkeletonRagIndex;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 骨骼生成 RAG 索引 Mapper
 *
 * 使用 XML 映射（SkeletonRagIndexMapper.xml）。
 * 支持两阶段检索：
 *   1. 精确过滤：style + pose + templateType（走联合索引）
 *   2. 文本相似：在精确过滤结果集上做 MATCH(...) AGAINST(...) 全文检索
 */
@Mapper
@Repository
public interface SkeletonRagIndexMapper {

    /**
     * 插入新的 RAG 索引记录（高质量任务完成后写入）
     * 若 sourceTaskId 已存在（UNIQUE KEY），则更新
     */
    int insertOrUpdate(SkeletonRagIndex ragIndex);

    /**
     * 第一阶段精确过滤：按 style + pose + templateType 查候选集
     * 结果按 userRating DESC, hitCount DESC 排序，最多返回 maxResults 条
     *
     * @param style        生成风格
     * @param pose         角色姿态
     * @param templateType 骨骼模板类型
     * @param maxResults   最大返回条数（建议10以内）
     */
    List<SkeletonRagIndex> findCandidates(@Param("style")        String style,
                                          @Param("pose")         String pose,
                                          @Param("templateType") String templateType,
                                          @Param("maxResults")   int maxResults);

    /**
     * 第二阶段全文检索：在候选集 ID 列表上做 MATCH AGAINST（BOOLEAN MODE）
     * 用于 prompt 相似度粗筛（MySQL FULLTEXT，不如向量检索精准但无需额外组件）
     *
     * @param promptKeywords 从用户 prompt 中提取的关键词（空格分隔）
     * @param style          精确过滤维度（降低全文检索范围）
     * @param pose           精确过滤维度
     * @param templateType   精确过滤维度
     * @param maxResults     最大返回条数
     */
    List<SkeletonRagIndex> findByPromptSimilarity(@Param("promptKeywords") String promptKeywords,
                                                  @Param("style")         String style,
                                                  @Param("pose")          String pose,
                                                  @Param("templateType")  String templateType,
                                                  @Param("maxResults")    int maxResults);

    /**
     * 命中后更新热度统计（hitCount++ 并更新 lastHitAt）
     */
    int incrementHitCount(@Param("id") Long id);

    /**
     * 根据 sourceTaskId 查询（去重用）
     */
    SkeletonRagIndex selectBySourceTaskId(@Param("sourceTaskId") String sourceTaskId);
}

