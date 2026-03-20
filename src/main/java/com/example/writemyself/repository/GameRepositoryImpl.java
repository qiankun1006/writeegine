package com.example.writemyself.repository;

import com.example.writemyself.mapper.GameMapper;
import com.example.writemyself.model.Game;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 游戏数据存储仓储实现
 * 使用MyBatis访问数据库
 */
@Repository
@Transactional
public class GameRepositoryImpl implements GameRepository {

    @Autowired
    private GameMapper gameMapper;

    /**
     * 保存或更新游戏
     */
    @Override
    public void save(Game game) {
        if (game.getId() == null) {
            // 插入新游戏
            gameMapper.insert(game);
        } else {
            // 更新现有游戏
            gameMapper.update(game);
        }
    }

    /**
     * 根据 ID 查询游戏
     */
    @Override
    public Game findById(String id) {
        return gameMapper.selectById(id);
    }

    /**
     * 获取所有游戏
     */
    @Override
    public List<Game> findAll() {
        return gameMapper.selectAll();
    }

    /**
     * 根据类型查询游戏
     */
    @Override
    public List<Game> findByType(String type) {
        return gameMapper.selectByType(type);
    }

    /**
     * 根据用户 ID 查询用户的所有游戏
     */
    @Override
    public List<Game> findByUserId(String userId) {
        return gameMapper.selectByUserId(userId);
    }

    /**
     * 关联用户和游戏
     */
    @Override
    public void associateUserWithGame(String userId, String gameId) {
        // TODO: Implement if needed
        // gameMapper.associateUserWithGame(userId, gameId);
    }

    /**
     * 删除游戏
     */
    @Override
    public void delete(String id) {
        gameMapper.deleteById(id);
    }

    /**
     * 删除所有游戏（仅用于测试）
     */
    @Override
    public void deleteAll() {
        // TODO: Implement if needed
        // gameMapper.deleteAll();
    }

    /**
     * 获取游戏数量
     */
    @Override
    public long count() {
        return gameMapper.count();
    }

    /**
     * 获取最近创建的游戏
     */
    public List<Game> getRecentGames(int limit) {
        return gameMapper.getRecentGames(limit);
    }

    /**
     * 批量保存游戏
     */
    public void batchSave(List<Game> games) {
        gameMapper.batchInsert(games);
    }

    /**
     * 批量更新游戏
     */
    public void batchUpdate(List<Game> games) {
        gameMapper.batchUpdate(games);
    }

    /**
     * 批量删除游戏
     */
    public void batchDelete(List<String> ids) {
        gameMapper.batchDelete(ids);
    }
}

