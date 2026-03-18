package com.example.writemyself;

import com.example.writemyself.entity.GameEntity;
import com.example.writemyself.mapper.GameMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * GameMapper测试
 * 测试MyBatis Mapper的基本CRUD操作
 */
@SpringBootTest
@ActiveProfiles("dev")
@Transactional // 测试完成后回滚数据
class GameMapperTest {

    @Autowired
    private GameMapper gameMapper;

    private String testGameId;
    private String testUserId;

    @BeforeEach
    void setUp() {
        testGameId = "test_game_" + UUID.randomUUID().toString().substring(0, 8);
        testUserId = "test_user_" + UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * 测试插入游戏
     */
    @Test
    void testInsertGame() {
        // 创建测试游戏
        GameEntity game = createTestGame(testGameId, testUserId);

        // 插入游戏
        int result = gameMapper.insert(game);

        // 验证插入结果
        assertThat(result).isEqualTo(1);

        // 验证游戏是否存在
        boolean exists = gameMapper.existsById(testGameId);
        assertThat(exists).isTrue();

        System.out.println("游戏插入测试通过，游戏ID: " + testGameId);
    }

    /**
     * 测试根据ID查询游戏
     */
    @Test
    void testSelectById() {
        // 先插入测试游戏
        GameEntity game = createTestGame(testGameId, testUserId);
        gameMapper.insert(game);

        // 查询游戏
        GameEntity retrievedGame = gameMapper.selectById(testGameId);

        // 验证查询结果
        assertThat(retrievedGame).isNotNull();
        assertThat(retrievedGame.getId()).isEqualTo(testGameId);
        assertThat(retrievedGame.getName()).isEqualTo("测试游戏");
        assertThat(retrievedGame.getType()).isEqualTo("2d-strategy");
        assertThat(retrievedGame.getUserId()).isEqualTo(testUserId);

        System.out.println("根据ID查询游戏测试通过");
    }

    /**
     * 测试更新游戏
     */
    @Test
    void testUpdateGame() {
        // 先插入测试游戏
        GameEntity game = createTestGame(testGameId, testUserId);
        gameMapper.insert(game);

        // 更新游戏信息
        game.setName("更新后的游戏名称");
        game.setDescription("更新后的游戏描述");
        game.setUpdatedAt(LocalDateTime.now());

        int result = gameMapper.update(game);

        // 验证更新结果
        assertThat(result).isEqualTo(1);

        // 验证更新后的数据
        GameEntity updatedGame = gameMapper.selectById(testGameId);
        assertThat(updatedGame).isNotNull();
        assertThat(updatedGame.getName()).isEqualTo("更新后的游戏名称");
        assertThat(updatedGame.getDescription()).isEqualTo("更新后的游戏描述");

        System.out.println("游戏更新测试通过");
    }

    /**
     * 测试删除游戏
     */
    @Test
    void testDeleteGame() {
        // 先插入测试游戏
        GameEntity game = createTestGame(testGameId, testUserId);
        gameMapper.insert(game);

        // 验证游戏存在
        boolean existsBefore = gameMapper.existsById(testGameId);
        assertThat(existsBefore).isTrue();

        // 删除游戏
        int result = gameMapper.deleteById(testGameId);

        // 验证删除结果
        assertThat(result).isEqualTo(1);

        // 验证游戏已删除
        boolean existsAfter = gameMapper.existsById(testGameId);
        assertThat(existsAfter).isFalse();

        System.out.println("游戏删除测试通过");
    }

    /**
     * 测试查询所有游戏
     */
    @Test
    void testSelectAll() {
        // 先插入几个测试游戏
        for (int i = 1; i <= 3; i++) {
            GameEntity game = createTestGame(testGameId + "_" + i, testUserId);
            game.setName("测试游戏 " + i);
            gameMapper.insert(game);
        }

        // 查询所有游戏
        List<GameEntity> games = gameMapper.selectAll();

        // 验证查询结果
        assertThat(games).isNotNull();
        assertThat(games.size()).isGreaterThanOrEqualTo(3);

        // 验证游戏按创建时间倒序排列
        if (games.size() > 1) {
            LocalDateTime previousDate = games.get(0).getCreatedAt();
            for (int i = 1; i < Math.min(3, games.size()); i++) {
                LocalDateTime currentDate = games.get(i).getCreatedAt();
                assertThat(previousDate).isAfterOrEqualTo(currentDate);
                previousDate = currentDate;
            }
        }

        System.out.println("查询所有游戏测试通过，找到 " + games.size() + " 个游戏");
    }

    /**
     * 测试根据用户ID查询游戏
     */
    @Test
    void testSelectByUserId() {
        // 为同一用户插入多个游戏
        for (int i = 1; i <= 3; i++) {
            GameEntity game = createTestGame(testGameId + "_" + i, testUserId);
            game.setName("用户游戏 " + i);
            gameMapper.insert(game);
        }

        // 为其他用户插入游戏
        String otherUserId = "other_user_" + UUID.randomUUID().toString().substring(0, 8);
        GameEntity otherGame = createTestGame("other_game", otherUserId);
        gameMapper.insert(otherGame);

        // 查询指定用户的游戏
        List<GameEntity> userGames = gameMapper.selectByUserId(testUserId);

        // 验证查询结果
        assertThat(userGames).isNotNull();
        assertThat(userGames.size()).isEqualTo(3);

        // 验证所有游戏都属于指定用户
        for (GameEntity game : userGames) {
            assertThat(game.getUserId()).isEqualTo(testUserId);
        }

        System.out.println("根据用户ID查询游戏测试通过，找到 " + userGames.size() + " 个游戏");
    }

    /**
     * 测试根据类型查询游戏
     */
    @Test
    void testSelectByType() {
        // 插入不同类型游戏
        String[] types = {"2d-strategy", "2d-metroidvania", "2d-rpg"};
        for (String type : types) {
            GameEntity game = createTestGame(testGameId + "_" + type, testUserId);
            game.setType(type);
            game.setName(type + " 游戏");
            gameMapper.insert(game);
        }

        // 查询特定类型游戏
        List<GameEntity> strategyGames = gameMapper.selectByType("2d-strategy");

        // 验证查询结果
        assertThat(strategyGames).isNotNull();
        assertThat(strategyGames.size()).isEqualTo(1);
        assertThat(strategyGames.get(0).getType()).isEqualTo("2d-strategy");

        System.out.println("根据类型查询游戏测试通过，找到 " + strategyGames.size() + " 个策略游戏");
    }

    /**
     * 测试统计游戏数量
     */
    @Test
    void testCountGames() {
        // 先获取当前游戏数量
        long initialCount = gameMapper.count();

        // 插入几个测试游戏
        for (int i = 1; i <= 3; i++) {
            GameEntity game = createTestGame(testGameId + "_" + i, testUserId);
            gameMapper.insert(game);
        }

        // 统计游戏数量
        long finalCount = gameMapper.count();

        // 验证统计结果
        assertThat(finalCount).isEqualTo(initialCount + 3);

        System.out.println("统计游戏数量测试通过，初始数量: " + initialCount + ", 最终数量: " + finalCount);
    }

    /**
     * 测试根据用户ID统计游戏数量
     */
    @Test
    void testCountByUserId() {
        // 为指定用户插入游戏
        for (int i = 1; i <= 2; i++) {
            GameEntity game = createTestGame(testGameId + "_" + i, testUserId);
            gameMapper.insert(game);
        }

        // 为其他用户插入游戏
        String otherUserId = "other_user_" + UUID.randomUUID().toString().substring(0, 8);
        GameEntity otherGame = createTestGame("other_game", otherUserId);
        gameMapper.insert(otherGame);

        // 统计指定用户的游戏数量
        long userGameCount = gameMapper.countByUserId(testUserId);

        // 验证统计结果
        assertThat(userGameCount).isEqualTo(2);

        System.out.println("根据用户ID统计游戏数量测试通过，用户 " + testUserId + " 有 " + userGameCount + " 个游戏");
    }

    /**
     * 测试分页查询
     */
    @Test
    void testSelectByPage() {
        // 插入多个测试游戏
        for (int i = 1; i <= 10; i++) {
            GameEntity game = createTestGame(testGameId + "_" + i, testUserId);
            game.setName("分页测试游戏 " + i);
            gameMapper.insert(game);
        }

        // 第一页，每页5条
        List<GameEntity> page1 = gameMapper.selectByPage(0, 5);

        // 验证第一页结果
        assertThat(page1).isNotNull();
        assertThat(page1.size()).isEqualTo(5);

        // 第二页，每页5条
        List<GameEntity> page2 = gameMapper.selectByPage(5, 5);

        // 验证第二页结果
        assertThat(page2).isNotNull();
        assertThat(page2.size()).isEqualTo(5);

        // 验证两页数据不重复
        for (GameEntity game1 : page1) {
            for (GameEntity game2 : page2) {
                assertThat(game1.getId()).isNotEqualTo(game2.getId());
            }
        }

        System.out.println("分页查询测试通过，第一页: " + page1.size() + " 条，第二页: " + page2.size() + " 条");
    }

    /**
     * 测试获取游戏统计信息
     */
    @Test
    void testGetStatistics() {
        // 插入一些测试数据
        String[] types = {"2d-strategy", "2d-metroidvania", "2d-rpg", "3d-shooter"};
        String[] users = {testUserId, "user2", "user3"};

        int gameCount = 0;
        for (String type : types) {
            for (String user : users) {
                GameEntity game = createTestGame(testGameId + "_" + type + "_" + user, user);
                game.setType(type);
                gameMapper.insert(game);
                gameCount++;
            }
        }

        // 获取统计信息
        Map<String, Object> statistics = gameMapper.getStatistics();

        // 验证统计信息
        assertThat(statistics).isNotNull();
        assertThat(statistics).containsKey("totalGames");

        Long totalGames = (Long) statistics.get("totalGames");
        assertThat(totalGames).isGreaterThanOrEqualTo(gameCount);

        System.out.println("游戏统计信息测试通过，总游戏数: " + totalGames);
        statistics.forEach((key, value) -> System.out.println(key + ": " + value));
    }

    /**
     * 创建测试游戏
     */
    private GameEntity createTestGame(String id, String userId) {
        GameEntity game = new GameEntity();
        game.setId(id);
        game.setName("测试游戏");
        game.setType("2d-strategy");
        game.setDescription("这是一个测试游戏");
        game.setThumbnailUrl("https://example.com/test.jpg");
        game.setConfig("{\"test\": true}");
        game.setUserId(userId);
        game.setCreatedAt(LocalDateTime.now());
        game.setUpdatedAt(LocalDateTime.now());
        return game;
    }
}

