package com.example.writemyself;

import com.example.writemyself.model.Game;
import com.example.writemyself.repository.GameRepository;
import com.example.writemyself.repository.GameRepositoryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * GameRepositoryImpl集成测试
 */
@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class GameRepositoryImplTest {

    @Autowired
    private GameRepository gameRepository;

    private Game testGame;

    @BeforeEach
    void setUp() {
        // 创建测试游戏
        testGame = new Game();
        testGame.setName("测试游戏");
        testGame.setType("RPG");
        testGame.setDescription("这是一个测试游戏");
        testGame.setUserId("test_user_123");

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("difficulty", "normal");
        metadata.put("version", "1.0.0");
        testGame.setMetadata(metadata);
    }

    @Test
    void testSaveNewGame() {
        // 保存新游戏
        gameRepository.save(testGame);

        // 验证游戏有ID
        assertThat(testGame.getId()).isNotNull();
        assertThat(testGame.getCreatedAt()).isGreaterThan(0);
        assertThat(testGame.getUpdatedAt()).isGreaterThan(0);

        // 根据ID查询验证
        Game retrievedGame = gameRepository.findById(testGame.getId());
        assertThat(retrievedGame).isNotNull();
        assertThat(retrievedGame.getName()).isEqualTo("测试游戏");
        assertThat(retrievedGame.getType()).isEqualTo("RPG");
        assertThat(retrievedGame.getUserId()).isEqualTo("test_user_123");
    }

    @Test
    void testSaveExistingGame() {
        // 先保存新游戏
        gameRepository.save(testGame);
        String gameId = testGame.getId();
        long originalUpdatedAt = testGame.getUpdatedAt();

        // 等待一小段时间，确保时间戳不同
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            // 忽略中断
        }

        // 更新游戏
        testGame.setName("更新后的游戏名称");
        testGame.setDescription("更新后的描述");
        gameRepository.save(testGame);

        // 验证ID不变，更新时间更新
        assertThat(testGame.getId()).isEqualTo(gameId);
        assertThat(testGame.getUpdatedAt()).isGreaterThan(originalUpdatedAt);

        // 查询验证更新
        Game retrievedGame = gameRepository.findById(gameId);
        assertThat(retrievedGame).isNotNull();
        assertThat(retrievedGame.getName()).isEqualTo("更新后的游戏名称");
        assertThat(retrievedGame.getDescription()).isEqualTo("更新后的描述");
    }

    @Test
    void testFindById() {
        // 保存游戏
        gameRepository.save(testGame);

        // 根据ID查询
        Game foundGame = gameRepository.findById(testGame.getId());
        assertThat(foundGame).isNotNull();
        assertThat(foundGame.getId()).isEqualTo(testGame.getId());

        // 查询不存在的ID
        Game nonExistentGame = gameRepository.findById("non_existent_id");
        assertThat(nonExistentGame).isNull();
    }

    @Test
    void testFindAll() {
        // 保存多个游戏
        for (int i = 0; i < 5; i++) {
            Game game = new Game();
            game.setName("游戏" + i);
            game.setType("类型" + (i % 3));
            game.setUserId("user_" + (i % 2));
            gameRepository.save(game);
        }

        // 查询所有游戏
        List<Game> allGames = gameRepository.findAll();
        assertThat(allGames).hasSizeGreaterThanOrEqualTo(5);

        // 验证游戏属性
        for (Game game : allGames) {
            assertThat(game.getId()).isNotNull();
            assertThat(game.getName()).isNotNull();
        }
    }

    @Test
    void testFindByType() {
        // 保存不同类型游戏
        Game rpgGame = new Game();
        rpgGame.setName("RPG游戏");
        rpgGame.setType("RPG");
        gameRepository.save(rpgGame);

        Game actionGame = new Game();
        actionGame.setName("动作游戏");
        actionGame.setType("ACTION");
        gameRepository.save(actionGame);

        Game anotherRpgGame = new Game();
        anotherRpgGame.setName("另一个RPG游戏");
        anotherRpgGame.setType("RPG");
        gameRepository.save(anotherRpgGame);

        // 查询RPG类型游戏
        List<Game> rpgGames = gameRepository.findByType("RPG");
        assertThat(rpgGames).hasSize(2);
        assertThat(rpgGames).allMatch(game -> "RPG".equals(game.getType()));

        // 查询ACTION类型游戏
        List<Game> actionGames = gameRepository.findByType("ACTION");
        assertThat(actionGames).hasSize(1);
        assertThat(actionGames.get(0).getType()).isEqualTo("ACTION");

        // 查询不存在的类型
        List<Game> nonExistentTypeGames = gameRepository.findByType("NON_EXISTENT");
        assertThat(nonExistentTypeGames).isEmpty();
    }

    @Test
    void testFindByUserId() {
        // 保存不同用户的游戏
        String user1 = "user_1";
        String user2 = "user_2";

        for (int i = 0; i < 3; i++) {
            Game game = new Game();
            game.setName("用户1游戏" + i);
            game.setType("TYPE_A");
            game.setUserId(user1);
            gameRepository.save(game);
        }

        for (int i = 0; i < 2; i++) {
            Game game = new Game();
            game.setName("用户2游戏" + i);
            game.setType("TYPE_B");
            game.setUserId(user2);
            gameRepository.save(game);
        }

        // 查询用户1的游戏
        List<Game> user1Games = gameRepository.findByUserId(user1);
        assertThat(user1Games).hasSize(3);
        assertThat(user1Games).allMatch(game -> user1.equals(game.getUserId()));

        // 查询用户2的游戏
        List<Game> user2Games = gameRepository.findByUserId(user2);
        assertThat(user2Games).hasSize(2);
        assertThat(user2Games).allMatch(game -> user2.equals(game.getUserId()));

        // 查询不存在的用户
        List<Game> nonExistentUserGames = gameRepository.findByUserId("non_existent_user");
        assertThat(nonExistentUserGames).isEmpty();
    }

    @Test
    void testAssociateUserWithGame() {
        // 保存游戏（无用户）
        testGame.setUserId(null);
        gameRepository.save(testGame);

        // 关联用户
        String userId = "associated_user_123";
        gameRepository.associateUserWithGame(userId, testGame.getId());

        // 验证关联成功
        Game updatedGame = gameRepository.findById(testGame.getId());
        assertThat(updatedGame).isNotNull();
        assertThat(updatedGame.getUserId()).isEqualTo(userId);

        // 尝试关联不存在的游戏（应该不会抛出异常）
        gameRepository.associateUserWithGame(userId, "non_existent_game_id");
    }

    @Test
    void testDelete() {
        // 保存游戏
        gameRepository.save(testGame);
        String gameId = testGame.getId();

        // 验证游戏存在
        Game beforeDelete = gameRepository.findById(gameId);
        assertThat(beforeDelete).isNotNull();

        // 删除游戏
        gameRepository.delete(gameId);

        // 验证游戏已删除
        Game afterDelete = gameRepository.findById(gameId);
        assertThat(afterDelete).isNull();

        // 删除不存在的游戏（应该不会抛出异常）
        gameRepository.delete("non_existent_id");
    }

    @Test
    void testCount() {
        // 初始计数
        long initialCount = gameRepository.count();

        // 保存多个游戏
        for (int i = 0; i < 3; i++) {
            Game game = new Game();
            game.setName("计数测试游戏" + i);
            game.setType("TEST");
            gameRepository.save(game);
        }

        // 验证计数增加
        long newCount = gameRepository.count();
        assertThat(newCount).isEqualTo(initialCount + 3);
    }

    @Test
    void testDeleteAll() {
        // 保存一些游戏
        for (int i = 0; i < 3; i++) {
            Game game = new Game();
            game.setName("删除测试游戏" + i);
            game.setType("DELETE_TEST");
            gameRepository.save(game);
        }

        // 验证有游戏存在
        long countBefore = gameRepository.count();
        assertThat(countBefore).isGreaterThan(0);

        // 删除所有游戏
        gameRepository.deleteAll();

        // 验证所有游戏已删除
        long countAfter = gameRepository.count();
        assertThat(countAfter).isEqualTo(0);
    }

    @Test
    void testFindByPage() {
        // 保存多个游戏
        for (int i = 0; i < 15; i++) {
            Game game = new Game();
            game.setName("分页测试游戏" + i);
            game.setType("PAGINATION");
            gameRepository.save(game);
        }

        // 测试分页查询
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;

        // 第一页，每页5条
        List<Game> page1 = repositoryImpl.findByPage(1, 5);
        assertThat(page1).hasSize(5);

        // 第二页，每页5条
        List<Game> page2 = repositoryImpl.findByPage(2, 5);
        assertThat(page2).hasSize(5);

        // 第三页，每页5条
        List<Game> page3 = repositoryImpl.findByPage(3, 5);
        assertThat(page3).hasSize(5);

        // 第四页，每页5条（应该只有0条）
        List<Game> page4 = repositoryImpl.findByPage(4, 5);
        assertThat(page4).hasSize(0);
    }

    @Test
    void testFindByCondition() {
        // 保存测试数据
        Game game1 = new Game();
        game1.setName("条件查询游戏1");
        game1.setType("CONDITION_A");
        game1.setUserId("condition_user_1");
        gameRepository.save(game1);

        Game game2 = new Game();
        game2.setName("条件查询游戏2");
        game2.setType("CONDITION_B");
        game2.setUserId("condition_user_2");
        gameRepository.save(game2);

        Game game3 = new Game();
        game3.setName("另一个游戏");
        game3.setType("CONDITION_A");
        game3.setUserId("condition_user_1");
        gameRepository.save(game3);

        // 条件查询
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;

        // 按类型查询
        Map<String, Object> condition1 = new HashMap<>();
        condition1.put("type", "CONDITION_A");
        List<Game> typeAGames = repositoryImpl.findByCondition(condition1);
        assertThat(typeAGames).hasSize(2);
        assertThat(typeAGames).allMatch(game -> "CONDITION_A".equals(game.getType()));

        // 按用户ID查询
        Map<String, Object> condition2 = new HashMap<>();
        condition2.put("userId", "condition_user_1");
        List<Game> user1Games = repositoryImpl.findByCondition(condition2);
        assertThat(user1Games).hasSize(2);
        assertThat(user1Games).allMatch(game -> "condition_user_1".equals(game.getUserId()));

        // 组合条件查询
        Map<String, Object> condition3 = new HashMap<>();
        condition3.put("type", "CONDITION_A");
        condition3.put("userId", "condition_user_1");
        List<Game> combinedGames = repositoryImpl.findByCondition(condition3);
        assertThat(combinedGames).hasSize(2);
    }

    @Test
    void testSearch() {
        // 保存测试数据
        Game game1 = new Game();
        game1.setName("搜索测试游戏");
        game1.setDescription("这是一个关于搜索功能的测试游戏");
        gameRepository.save(game1);

        Game game2 = new Game();
        game2.setName("另一个游戏");
        game2.setDescription("这个游戏不包含搜索关键词");
        gameRepository.save(game2);

        Game game3 = new Game();
        game3.setName("搜索功能演示");
        game3.setDescription("演示搜索功能如何工作");
        gameRepository.save(game3);

        // 搜索测试
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;

        // 搜索"搜索"
        List<Game> searchResults1 = repositoryImpl.search("搜索");
        assertThat(searchResults1).hasSize(2); // game1和game3
        assertThat(searchResults1).allMatch(game ->
            game.getName().contains("搜索") ||
            (game.getDescription() != null && game.getDescription().contains("搜索"))
        );

        // 搜索"测试"
        List<Game> searchResults2 = repositoryImpl.search("测试");
        assertThat(searchResults2).hasSize(1); // game1
        assertThat(searchResults2.get(0).getName()).contains("测试");

        // 搜索不存在的关键词
        List<Game> searchResults3 = repositoryImpl.search("不存在的关键词");
        assertThat(searchResults3).isEmpty();
    }

    @Test
    void testExistsById() {
        // 保存游戏
        gameRepository.save(testGame);

        // 测试存在
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;
        boolean exists = repositoryImpl.existsById(testGame.getId());
        assertThat(exists).isTrue();

        // 测试不存在
        boolean notExists = repositoryImpl.existsById("non_existent_id");
        assertThat(notExists).isFalse();
    }

    @Test
    void testExistsByName() {
        // 保存游戏
        gameRepository.save(testGame);

        // 测试存在
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;
        boolean exists = repositoryImpl.existsByName("测试游戏");
        assertThat(exists).isTrue();

        // 测试不存在
        boolean notExists = repositoryImpl.existsByName("不存在的游戏名称");
        assertThat(notExists).isFalse();
    }

    @Test
    void testGetRecentGames() {
        // 保存多个游戏
        for (int i = 0; i < 10; i++) {
            Game game = new Game();
            game.setName("最近游戏" + i);
            game.setType("RECENT");
            gameRepository.save(game);
        }

        // 获取最近5个游戏
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;
        List<Game> recentGames = repositoryImpl.getRecentGames(5);

        // 验证数量
        assertThat(recentGames).hasSize(5);

        // 验证游戏名称（应该是最新创建的）
        for (int i = 0; i < recentGames.size(); i++) {
            assertThat(recentGames.get(i).getName()).contains("最近游戏");
        }
    }

    @Test
    void testBatchOperations() {
        // 创建批量游戏
        List<Game> games = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Game game = new Game();
            game.setName("批量游戏" + i);
            game.setType("BATCH");
            game.setUserId("batch_user");
            games.add(game);
        }

        // 批量保存
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;
        repositoryImpl.batchSave(games);

        // 验证所有游戏都有ID
        assertThat(games).allMatch(game -> game.getId() != null);

        // 验证游戏数量
        long countAfterSave = gameRepository.count();
        assertThat(countAfterSave).isGreaterThanOrEqualTo(5);

        // 批量更新
        for (Game game : games) {
            game.setName(game.getName() + "_更新");
        }
        repositoryImpl.batchUpdate(games);

        // 验证更新
        for (Game game : games) {
            Game retrievedGame = gameRepository.findById(game.getId());
            assertThat(retrievedGame).isNotNull();
            assertThat(retrievedGame.getName()).endsWith("_更新");
        }

        // 批量删除
        List<String> gameIds = new ArrayList<>();
        for (Game game : games) {
            gameIds.add(game.getId());
        }
        repositoryImpl.batchDelete(gameIds);

        // 验证删除
        for (String gameId : gameIds) {
            Game deletedGame = gameRepository.findById(gameId);
            assertThat(deletedGame).isNull();
        }
    }

    @Test
    void testGetStatistics() {
        // 保存一些测试数据
        for (int i = 0; i < 3; i++) {
            Game game = new Game();
            game.setName("统计测试游戏" + i);
            game.setType("STAT_A");
            game.setUserId("stat_user_1");
            gameRepository.save(game);
        }

        for (int i = 0; i < 2; i++) {
            Game game = new Game();
            game.setName("统计测试游戏" + (i + 3));
            game.setType("STAT_B");
            game.setUserId("stat_user_2");
            gameRepository.save(game);
        }

        // 获取统计信息
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;
        Map<String, Object> statistics = repositoryImpl.getStatistics();

        // 验证统计信息不为空
        assertThat(statistics).isNotNull();
        assertThat(statistics).isNotEmpty();

        // 验证包含基本统计字段
        assertThat(statistics).containsKeys("totalGames", "totalTypes", "totalUsers");
    }

    @Test
    void testGetUserGameStats() {
        // 保存用户游戏数据
        String userId = "stats_user";

        for (int i = 0; i < 4; i++) {
            Game game = new Game();
            game.setName("用户统计游戏" + i);
            game.setType(i % 2 == 0 ? "TYPE_X" : "TYPE_Y");
            game.setUserId(userId);
            gameRepository.save(game);
        }

        // 获取用户游戏统计
        GameRepositoryImpl repositoryImpl = (GameRepositoryImpl) gameRepository;
        Map<String, Object> userStats = repositoryImpl.getUserGameStats(userId);

        // 验证统计信息
        assertThat(userStats).isNotNull();
        assertThat(userStats).isNotEmpty();

        // 验证包含用户特定统计
        assertThat(userStats).containsKey("userId");
        assertThat(userStats.get("userId")).isEqualTo(userId);
    }
}

