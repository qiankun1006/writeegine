package com.example.writemyself.repository;

import com.example.writemyself.model.Game;
import java.util.Optional;
import java.util.*;

/**
 * 游戏数据存储仓储接口
 * 支持内存存储和数据库存储
 */
public interface GameRepository {
    /**
     * 保存或更新游戏
     */
    void save(Game game);
    /**
     * 根据 ID 查询游戏
     */
    Game findById(String id);

    /**
     * 获取所有游戏
     */
    List<Game> findAll();

    /**
     * 根据类型查询游戏
     */
    List<Game> findByType(String type);

    /**
     * 根据用户 ID 查询用户的所有游戏
     */
    List<Game> findByUserId(String userId);

    /**
     * 关联用户和游戏
     */
    void associateUserWithGame(String userId, String gameId);

    /**
     * 删除游戏
     */
    void delete(String id);

    /**
     * 删除所有游戏（仅用于测试）
     */
    void deleteAll();

    /**
     * 获取游戏数量
     */
    long count();
}

