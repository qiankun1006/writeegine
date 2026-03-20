package com.example.writemyself;

import com.example.writemyself.model.*;
import com.example.writemyself.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 快速验证 Repository 功能
 * 只包含最关键的 INSERT 和 SELECT 操作
 */
@SpringBootTest
@ActiveProfiles("dev")
@Transactional
@DisplayName("Repository快速验证测试")
public class RepositoriesQuickTest {

    @Autowired
    private AIPortraitGenerationRepository generationRepository;

    @Autowired
    private AIPortraitTaskRepository taskRepository;

    @Autowired
    private AIPortraitModelConfigRepository configRepository;

    @Autowired
    private GameRepository gameRepository;

    @Test
    @DisplayName("✓ AIPortraitGeneration 表：插入 + 查询")
    void testGenerationInsertSelect() {
        // 插入
        AIPortraitGeneration gen = new AIPortraitGeneration();
        gen.setUserId("user1");
        gen.setTaskId("task_gen_" + System.currentTimeMillis());
        gen.setPrompt("test prompt");
        gen.setStatus("PENDING");
        gen.setWidth(512);
        gen.setHeight(512);
        generationRepository.save(gen);

        // 验证插入成功（会自动生成ID）
        System.out.println("✅ Generation saved with ID: " + gen.getId());

        // 查询
        Optional<AIPortraitGeneration> found = generationRepository.findById(gen.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getUserId()).isEqualTo("user1");
        assertThat(found.get().getPrompt()).isEqualTo("test prompt");
        System.out.println("✅ AIPortraitGeneration 通过测试");
    }

    @Test
    @DisplayName("✓ AIPortraitTask 表：插入 + 查询")
    void testTaskInsertSelect() {
        // 先创建 generation
        AIPortraitGeneration gen = new AIPortraitGeneration();
        gen.setUserId("user2");
        gen.setTaskId("gen_" + System.nanoTime());
        gen.setPrompt("test");
        gen.setStatus("PENDING");
        gen.setWidth(512);
        gen.setHeight(512);
        generationRepository.save(gen);

        // 插入 task
        AIPortraitTask task = new AIPortraitTask();
        task.setTaskId("task_" + System.nanoTime());
        task.setGenerationId(gen.getId());
        task.setStatus("PENDING");
        task.setProgress(0);
        taskRepository.save(task);

        // 验证插入成功
        assertThat(task.getId()).isNotNull();

        // 查询
        Optional<AIPortraitTask> found = taskRepository.findById(task.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo("PENDING");
        assertThat(found.get().getGenerationId()).isEqualTo(gen.getId());
        System.out.println("✅ AIPortraitTask 通过测试");
    }

    @Test
    @DisplayName("✓ AIPortraitModelConfig 表：插入 + 查询")
    void testConfigInsertSelect() {
        // 插入
        AIPortraitModelConfig config = new AIPortraitModelConfig();
        config.setModelName("model_" + System.nanoTime());
        config.setDisplayName("Test Model");
        config.setProvider("volcengine");
        config.setIsActive(true);
        configRepository.save(config);

        // 验证插入成功
        assertThat(config.getId()).isNotNull();

        // 查询
        Optional<AIPortraitModelConfig> found = configRepository.findById(config.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getDisplayName()).isEqualTo("Test Model");
        assertThat(found.get().getProvider()).isEqualTo("volcengine");
        System.out.println("✅ AIPortraitModelConfig 通过测试");
    }

    @Test
    @DisplayName("✓ Game 表：插入 + 查询")
    void testGameInsertSelect() {
        // 插入
        Game game = new Game();
        game.setId("game_" + System.nanoTime());
        game.setName("Test Game");
        game.setType("RPG");
        game.setUserId("user3");
        gameRepository.save(game);

        // 查询
        Game found = gameRepository.findById(game.getId());
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo("Test Game");
        assertThat(found.getType()).isEqualTo("RPG");
        assertThat(found.getUserId()).isEqualTo("user3");
        System.out.println("✅ Game 通过测试");
    }

    @Test
    @DisplayName("✓ 完整流程测试：模型配置 → 生成 → 任务")
    void testCompleteFlow() {
        // 1. 创建模型配置
        AIPortraitModelConfig config = new AIPortraitModelConfig();
        config.setModelName("flow_" + System.nanoTime());
        config.setDisplayName("Flow Model");
        config.setProvider("local");
        config.setIsActive(true);
        configRepository.save(config);
        assertThat(config.getId()).isNotNull();

        // 2. 创建生成记录
        AIPortraitGeneration gen = new AIPortraitGeneration();
        gen.setUserId("flow_user");
        gen.setTaskId("flow_" + System.nanoTime());
        gen.setPrompt("Generate portrait");
        gen.setModelName(config.getModelName());
        gen.setStatus("PENDING");
        gen.setWidth(512);
        gen.setHeight(512);
        generationRepository.save(gen);
        assertThat(gen.getId()).isNotNull();

        // 3. 创建任务记录
        AIPortraitTask task = new AIPortraitTask();
        task.setTaskId("task_" + System.nanoTime());
        task.setGenerationId(gen.getId());
        task.setStatus("PENDING");
        task.setProgress(0);
        taskRepository.save(task);
        assertThat(task.getId()).isNotNull();

        // 4. 验证完整流程
        Optional<AIPortraitTask> taskFound = taskRepository.findById(task.getId());
        assertThat(taskFound).isPresent();

        Optional<AIPortraitGeneration> genFound = generationRepository.findById(taskFound.get().getGenerationId());
        assertThat(genFound).isPresent();
        assertThat(genFound.get().getModelName()).isEqualTo(config.getModelName());

        Optional<AIPortraitModelConfig> configFound = configRepository.findByModelName(config.getModelName());
        assertThat(configFound).isPresent();

        System.out.println("✅ 完整流程通过测试");
    }

    @Test
    @DisplayName("✓ 所有表都能正常工作")
    void testAllTablesWork() {
        System.out.println("\n=== Repository 集成测试 ===");

        // Game
        Game game = new Game();
        game.setId("all_test_" + System.nanoTime());
        game.setName("All Test Game");
        game.setType("TEST");
        gameRepository.save(game);
        assertThat(gameRepository.findById(game.getId())).isNotNull();
        System.out.println("✅ Game 表工作正常");

        // AIPortraitModelConfig
        AIPortraitModelConfig config = new AIPortraitModelConfig();
        config.setModelName("all_" + System.nanoTime());
        config.setDisplayName("All Test");
        config.setProvider("test");
        config.setIsActive(true);
        configRepository.save(config);
        assertThat(configRepository.findById(config.getId())).isPresent();
        System.out.println("✅ AIPortraitModelConfig 表工作正常");

        // AIPortraitGeneration
        AIPortraitGeneration gen = new AIPortraitGeneration();
        gen.setUserId("all");
        gen.setTaskId("all_" + System.nanoTime());
        gen.setPrompt("test");
        gen.setStatus("PENDING");
        gen.setWidth(512);
        gen.setHeight(512);
        generationRepository.save(gen);
        assertThat(generationRepository.findById(gen.getId())).isPresent();
        System.out.println("✅ AIPortraitGeneration 表工作正常");

        // AIPortraitTask
        AIPortraitTask task = new AIPortraitTask();
        task.setTaskId("all_" + System.nanoTime());
        task.setGenerationId(gen.getId());
        task.setStatus("PENDING");
        task.setProgress(0);
        taskRepository.save(task);
        assertThat(taskRepository.findById(task.getId())).isPresent();
        System.out.println("✅ AIPortraitTask 表工作正常");

        System.out.println("\n🎉 所有 Repository 通过测试！");
    }
}

