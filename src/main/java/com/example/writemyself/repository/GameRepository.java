package com.example.writemyself.repository;

import com.example.writemyself.model.Game;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 游戏数据存储仓储
 * 使用内存存储（可后续替换为数据库）
 */
public class GameRepository {
    /**
     * 存储所有游戏，key 为 gameId
     */
    private static final Map<String, Game> gameStore = new ConcurrentHashMap<>();

    /**
     * 存储用户游戏关联，key 为 userId，value 为该用户的 gameId 列表
     */
    private static final Map<String, List<String>> userGamesMap = new ConcurrentHashMap<>();

    /**
     * 保存或更新游戏
     */
    public void save(Game game) {
        if (game.getId() == null) {
            game.setId("game_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        }
        game.setUpdatedAt(System.currentTimeMillis());
        gameStore.put(game.getId(), game);
    }

    /**
     * 根据 ID 查询游戏
     */
    public Game findById(String id) {
        return gameStore.get(id);
    }

    /**
     * 获取所有游戏
     */
    public List<Game> findAll() {
        return new ArrayList<>(gameStore.values());
    }

    /**
     * 根据类型查询游戏
     */
    public List<Game> findByType(String type) {
        List<Game> result = new ArrayList<>();
        for (Game game : gameStore.values()) {
            if (game.getType() != null && game.getType().equals(type)) {
                result.add(game);
            }
        }
        return result;
    }

    /**
     * 根据用户 ID 查询用户的所有游戏
     */
    public List<Game> findByUserId(String userId) {
        List<String> gameIds = userGamesMap.get(userId);
        if (gameIds == null || gameIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<Game> result = new ArrayList<>();
        for (String gameId : gameIds) {
            Game game = gameStore.get(gameId);
            if (game != null) {
                result.add(game);
            }
        }
        return result;
    }

    /**
     * 关联用户和游戏
     */
    public void associateUserWithGame(String userId, String gameId) {
        userGamesMap.computeIfAbsent(userId, k -> Collections.synchronizedList(new ArrayList<>())).add(gameId);
    }

    /**
     * 删除游戏
     */
    public void delete(String id) {
        gameStore.remove(id);
        // 从所有用户的游戏列表中移除
        userGamesMap.values().forEach(gameIds -> gameIds.remove(id));
    }

    /**
     * 删除所有游戏（仅用于测试）
     */
    public void deleteAll() {
        gameStore.clear();
        userGamesMap.clear();
    }

    /**
     * 获取游戏数量
     */
    public long count() {
        return gameStore.size();
    }
}

