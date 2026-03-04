package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AI 立绘模型配置 Repository
 */
@Repository
public interface AIPortraitModelConfigRepository extends JpaRepository<AIPortraitModelConfig, Long> {

    /**
     * 根据模型名称查询配置
     */
    Optional<AIPortraitModelConfig> findByModelName(String modelName);

    /**
     * 根据提供商和状态查询所有模型
     */
    List<AIPortraitModelConfig> findByProviderAndIsActive(String provider, Boolean isActive);

    /**
     * 查询所有启用的模型
     */
    List<AIPortraitModelConfig> findByIsActive(Boolean isActive);

    /**
     * 查询默认模型
     */
    Optional<AIPortraitModelConfig> findByIsDefault(Boolean isDefault);

    /**
     * 查询指定提供商的所有模型
     */
    List<AIPortraitModelConfig> findByProvider(String provider);
}

