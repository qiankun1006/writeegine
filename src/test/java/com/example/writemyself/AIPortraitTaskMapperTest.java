package com.example.writemyself;

import com.example.writemyself.entity.AIPortraitTask;
import com.example.writemyself.mapper.AIPortraitTaskMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * AIPortraitTaskMapper单元测试
 */
@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class AIPortraitTaskMapperTest {

    @Autowired
    private AIPortraitTaskMapper aiPortraitTaskMapper;

    private AIPortraitTask testTask;

    @BeforeEach
    void setUp() {
        // 创建测试任务
        testTask = AIPortraitTask.builder()
                .taskId("test-task-" + UUID.randomUUID().toString())
                .generationId(1L)
                .status("PENDING")
                .progress(0)
                .retryCount(0)
                .maxRetries(3)
                .lastError(null)
                .startedAt(null)
                .completedAt(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testInsertAndSelectById() {
        // 插入任务
        int insertResult = aiPortraitTaskMapper.insert(testTask);
        assertThat(insertResult).isEqualTo(1);
        assertThat(testTask.getId()).isNotNull();

        // 根据ID查询
        AIPortraitTask retrievedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(retrievedTask).isNotNull();
        assertThat(retrievedTask.getTaskId()).isEqualTo(testTask.getTaskId());
        assertThat(retrievedTask.getStatus()).isEqualTo("PENDING");
    }

    @Test
    void testSelectByTaskId() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 根据任务ID查询
        AIPortraitTask retrievedTask = aiPortraitTaskMapper.selectByTaskId(testTask.getTaskId());
        assertThat(retrievedTask).isNotNull();
        assertThat(retrievedTask.getTaskId()).isEqualTo(testTask.getTaskId());
    }

    @Test
    void testSelectByStatus() {
        // 插入多个不同状态的任务
        AIPortraitTask pendingTask = createTaskWithStatus("PENDING");
        AIPortraitTask processingTask = createTaskWithStatus("PROCESSING");
        AIPortraitTask successTask = createTaskWithStatus("SUCCESS");

        aiPortraitTaskMapper.insert(pendingTask);
        aiPortraitTaskMapper.insert(processingTask);
        aiPortraitTaskMapper.insert(successTask);

        // 查询PENDING状态的任务
        List<AIPortraitTask> pendingTasks = aiPortraitTaskMapper.selectByStatus("PENDING");
        assertThat(pendingTasks).hasSize(1);
        assertThat(pendingTasks.get(0).getStatus()).isEqualTo("PENDING");

        // 查询SUCCESS状态的任务
        List<AIPortraitTask> successTasks = aiPortraitTaskMapper.selectByStatus("SUCCESS");
        assertThat(successTasks).hasSize(1);
        assertThat(successTasks.get(0).getStatus()).isEqualTo("SUCCESS");
    }

    @Test
    void testUpdate() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 更新任务
        testTask.setStatus("PROCESSING");
        testTask.setProgress(50);
        testTask.setStartedAt(LocalDateTime.now());
        testTask.setUpdatedAt(LocalDateTime.now());

        int updateResult = aiPortraitTaskMapper.update(testTask);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新
        AIPortraitTask updatedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(updatedTask.getStatus()).isEqualTo("PROCESSING");
        assertThat(updatedTask.getProgress()).isEqualTo(50);
        assertThat(updatedTask.getStartedAt()).isNotNull();
    }

    @Test
    void testDeleteById() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 删除任务
        int deleteResult = aiPortraitTaskMapper.deleteById(testTask.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证删除
        AIPortraitTask deletedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(deletedTask).isNull();
    }

    @Test
    void testCount() {
        // 初始计数
        long initialCount = aiPortraitTaskMapper.count();

        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 验证计数增加
        long newCount = aiPortraitTaskMapper.count();
        assertThat(newCount).isEqualTo(initialCount + 1);
    }

    @Test
    void testExistsById() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 验证存在
        boolean exists = aiPortraitTaskMapper.existsById(testTask.getId());
        assertThat(exists).isTrue();

        // 验证不存在
        boolean notExists = aiPortraitTaskMapper.existsById(999999L);
        assertThat(notExists).isFalse();
    }

    @Test
    void testUpdateStatus() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 更新状态
        LocalDateTime updatedAt = LocalDateTime.now();
        int updateResult = aiPortraitTaskMapper.updateStatus(testTask.getId(), "PROCESSING", updatedAt);
        assertThat(updateResult).isEqualTo(1);

        // 验证状态更新
        AIPortraitTask updatedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(updatedTask.getStatus()).isEqualTo("PROCESSING");
    }

    @Test
    void testUpdateProgress() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 更新进度
        LocalDateTime updatedAt = LocalDateTime.now();
        int updateResult = aiPortraitTaskMapper.updateProgress(testTask.getId(), 75, updatedAt);
        assertThat(updateResult).isEqualTo(1);

        // 验证进度更新
        AIPortraitTask updatedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(updatedTask.getProgress()).isEqualTo(75);
    }

    @Test
    void testMarkAsProcessing() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 标记为处理中
        LocalDateTime startedAt = LocalDateTime.now();
        LocalDateTime updatedAt = LocalDateTime.now();
        int updateResult = aiPortraitTaskMapper.markAsProcessing(testTask.getId(), startedAt, updatedAt);
        assertThat(updateResult).isEqualTo(1);

        // 验证状态和开始时间
        AIPortraitTask updatedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(updatedTask.getStatus()).isEqualTo("PROCESSING");
        assertThat(updatedTask.getStartedAt()).isNotNull();
    }

    @Test
    void testMarkAsSuccess() {
        // 插入任务
        aiPortraitTaskMapper.insert(testTask);

        // 标记为成功
        LocalDateTime completedAt = LocalDateTime.now();
        LocalDateTime updatedAt = LocalDateTime.now();
        int updateResult = aiPortraitTaskMapper.markAsSuccess(testTask.getId(), completedAt, updatedAt);
        assertThat(updateResult).isEqualTo(1);

        // 验证状态和完成时间
        AIPortraitTask updatedTask = aiPortraitTaskMapper.selectById(testTask.getId());
        assertThat(updatedTask.getStatus()).isEqualTo("SUCCESS");
        assertThat(updatedTask.getProgress()).isEqualTo(100);
        assertThat(updatedTask.getCompletedAt()).isNotNull();
    }

    @Test
    void testSelectPendingTasks() {
        // 插入多个PENDING任务
        for (int i = 0; i < 5; i++) {
            AIPortraitTask task = createTaskWithStatus("PENDING");
            aiPortraitTaskMapper.insert(task);
        }

        // 查询待处理任务
        List<AIPortraitTask> pendingTasks = aiPortraitTaskMapper.selectPendingTasks(10);
        assertThat(pendingTasks).isNotEmpty();
        assertThat(pendingTasks).allMatch(task -> "PENDING".equals(task.getStatus()));
    }

    @Test
    void testSelectByCondition() {
        // 插入多个任务
        AIPortraitTask task1 = createTaskWithStatus("PENDING");
        task1.setProgress(0);
        aiPortraitTaskMapper.insert(task1);

        AIPortraitTask task2 = createTaskWithStatus("PROCESSING");
        task2.setProgress(50);
        aiPortraitTaskMapper.insert(task2);

        AIPortraitTask task3 = createTaskWithStatus("SUCCESS");
        task3.setProgress(100);
        task3.setLastError("Test error");
        aiPortraitTaskMapper.insert(task3);

        // 条件查询：状态为PENDING
        Map<String, Object> params1 = new HashMap<>();
        params1.put("status", "PENDING");
        List<AIPortraitTask> pendingTasks = aiPortraitTaskMapper.selectByCondition(params1);
        assertThat(pendingTasks).hasSize(1);
        assertThat(pendingTasks.get(0).getStatus()).isEqualTo("PENDING");

        // 条件查询：进度大于等于50
        Map<String, Object> params2 = new HashMap<>();
        params2.put("minProgress", 50);
        List<AIPortraitTask> highProgressTasks = aiPortraitTaskMapper.selectByCondition(params2);
        assertThat(highProgressTasks).hasSize(2); // PROCESSING和SUCCESS

        // 条件查询：有错误信息
        Map<String, Object> params3 = new HashMap<>();
        params3.put("hasError", true);
        List<AIPortraitTask> errorTasks = aiPortraitTaskMapper.selectByCondition(params3);
        assertThat(errorTasks).hasSize(1);
        assertThat(errorTasks.get(0).getLastError()).isNotNull();
    }

    @Test
    void testSelectByPage() {
        // 插入多个任务
        for (int i = 0; i < 15; i++) {
            AIPortraitTask task = createTaskWithStatus("PENDING");
            aiPortraitTaskMapper.insert(task);
        }

        // 分页查询：第一页，每页10条
        List<AIPortraitTask> page1 = aiPortraitTaskMapper.selectByPage(10, 0);
        assertThat(page1).hasSize(10);

        // 分页查询：第二页，每页10条
        List<AIPortraitTask> page2 = aiPortraitTaskMapper.selectByPage(10, 10);
        assertThat(page2).hasSize(5); // 总共15条，第二页只有5条
    }

    @Test
    void testBatchInsert() {
        // 创建批量任务
        List<AIPortraitTask> tasks = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            AIPortraitTask task = createTaskWithStatus("PENDING");
            tasks.add(task);
        }

        // 批量插入
        int insertResult = aiPortraitTaskMapper.batchInsert(tasks);
        assertThat(insertResult).isEqualTo(5);

        // 验证所有任务都有ID
        assertThat(tasks).allMatch(task -> task.getId() != null);
    }

    @Test
    void testGetStatistics() {
        // 插入一些测试数据
        for (int i = 0; i < 3; i++) {
            AIPortraitTask task = createTaskWithStatus("PENDING");
            aiPortraitTaskMapper.insert(task);
        }
        for (int i = 0; i < 2; i++) {
            AIPortraitTask task = createTaskWithStatus("SUCCESS");
            aiPortraitTaskMapper.insert(task);
        }

        // 获取统计信息
        List<Map<String, Object>> statistics = aiPortraitTaskMapper.getStatistics();
        assertThat(statistics).isNotEmpty();
    }

    @Test
    void testGetStatusDistribution() {
        // 插入不同状态的任务
        aiPortraitTaskMapper.insert(createTaskWithStatus("PENDING"));
        aiPortraitTaskMapper.insert(createTaskWithStatus("PENDING"));
        aiPortraitTaskMapper.insert(createTaskWithStatus("SUCCESS"));

        // 获取状态分布
        List<Map<String, Object>> distribution = aiPortraitTaskMapper.getStatusDistribution();
        assertThat(distribution).hasSize(2); // PENDING和SUCCESS两种状态
    }

    @Test
    void testCountByCondition() {
        // 插入测试数据
        AIPortraitTask task1 = createTaskWithStatus("PENDING");
        task1.setProgress(30);
        aiPortraitTaskMapper.insert(task1);

        AIPortraitTask task2 = createTaskWithStatus("PROCESSING");
        task2.setProgress(60);
        aiPortraitTaskMapper.insert(task2);

        // 条件统计：状态为PENDING
        Map<String, Object> params = new HashMap<>();
        params.put("status", "PENDING");
        long count = aiPortraitTaskMapper.countByCondition(params);
        assertThat(count).isEqualTo(1);

        // 条件统计：进度大于等于50
        params.clear();
        params.put("minProgress", 50);
        count = aiPortraitTaskMapper.countByCondition(params);
        assertThat(count).isEqualTo(1);
    }

    private AIPortraitTask createTaskWithStatus(String status) {
        return AIPortraitTask.builder()
                .taskId("test-task-" + UUID.randomUUID().toString())
                .generationId(1L)
                .status(status)
                .progress(0)
                .retryCount(0)
                .maxRetries(3)
                .lastError(null)
                .startedAt(null)
                .completedAt(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}

