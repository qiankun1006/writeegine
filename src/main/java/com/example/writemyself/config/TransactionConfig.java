package com.example.writemyself.config;

import org.springframework.context.annotation.Configuration;

/**
 * 事务管理配置类
 * 配置事务拦截器和事务属性
 * 注：事务管理由 MyBatisConfig 中的 PlatformTransactionManager 负责
 * 业务层的事务控制使用 @Transactional 注解
 */
@Configuration
public class TransactionConfig {
    // 事务管理由MyBatisConfig负责，此处保留为占位符
}

