package com.example.writemyself.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 异步处理配置类
 * 为 AI 立绘生成任务提供线程池支持
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig {

    /**
     * 配置 AI 立绘生成任务的线程池
     * 核心线程数：5
     * 最大线程数：10
     * 队列容量：100
     */
    @Bean(name = "portraitTaskExecutor")
    public Executor portraitTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 核心线程数 - 始终保持活跃的线程数
        executor.setCorePoolSize(5);

        // 最大线程数 - 最多可创建的线程数
        executor.setMaxPoolSize(10);

        // 队列容量 - 任务队列的大小
        executor.setQueueCapacity(100);

        // 线程名称前缀 - 便于调试
        executor.setThreadNamePrefix("ai-portrait-");

        // 等待任务完成的最大时间（秒）
        executor.setAwaitTerminationSeconds(60);

        // 是否等待任务完成后再关闭线程池
        executor.setWaitForTasksToCompleteOnShutdown(true);

        // 拒绝策略 - 当任务队列满时，新任务由提交线程执行
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // 初始化线程池
        executor.initialize();

        log.info("✓ AI 立绘任务线程池已配置: 核心线程数={}, 最大线程数={}, 队列容量={}",
                executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());

        return executor;
    }
}

