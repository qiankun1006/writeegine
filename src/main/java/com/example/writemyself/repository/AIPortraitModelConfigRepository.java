package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AI肖像模型配置仓库
 */
@Repository
public interface AIPortraitModelConfigRepository extends JpaRepository<AIPortraitModelConfig, Long> {

    /**
     * 根据模型名称查找配置
     */
    Optional<AIPortraitModelConfig> findByModelName(String modelName);

    /**
     * 查找所有活跃的模型配置
     */
    List<AIPortraitModelConfig> findByIsActiveTrue();

    /**
     * 根据提供商查找模型配置
     */
    List<AIPortraitModelConfig> findByProviderAndIsActiveTrue(String provider);

    /**
     * 检查模型名称是否存在
     */
    boolean existsByModelName(String modelName);
}

