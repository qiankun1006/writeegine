package com.example.writemyself.repository;

import com.example.writemyself.entity.GameEntity;
import com.example.writemyself.mapper.GameMapper;
import com.example.writemyself.model.Game;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
        GameEntity gameEntity = convertToEntity(game);

        if (game.getId() == null) {
            // 生成新的游戏ID
            game.setId("game_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
            gameEntity.setId(game.getId());

            // 设置创建时间和更新时间
            game.setCreatedAt(System.currentTimeMillis());
            game.setUpdatedAt(System.currentTimeMillis());
            gameEntity.setCreatedAt(LocalDateTime.now());
            gameEntity.setUpdatedAt(LocalDateTime.now());

            // 插入新游戏
            gameMapper.insert(gameEntity);
        } else {
            // 更新现有游戏
            game.setUpdatedAt(System.currentTimeMillis());
            gameEntity.setUpdatedAt(LocalDateTime.now());

            gameMapper.update(gameEntity);
        }
    }

    /**
     * 根据 ID 查询游戏
     */
    @Override
    public Game findById(String id) {
        GameEntity gameEntity = gameMapper.selectById(id);
        if (gameEntity == null) {
            return null;
        }
        return convertToModel(gameEntity);
    }

    /**
     * 获取所有游戏
     */
    @Override
    public List<Game> findAll() {
        List<GameEntity> gameEntities = gameMapper.selectAll();
        return convertToModelList(gameEntities);
    }

    /**
     * 根据类型查询游戏
     */
    @Override
    public List<Game> findByType(String type) {
        List<GameEntity> gameEntities = gameMapper.selectByType(type);
        return convertToModelList(gameEntities);
    }

    /**
     * 根据用户 ID 查询用户的所有游戏
     */
    @Override
    public List<Game> findByUserId(String userId) {
        List<GameEntity> gameEntities = gameMapper.selectByUserId(userId);
        return convertToModelList(gameEntities);
    }

    /**
     * 关联用户和游戏
     * 注意：在数据库设计中，用户ID直接存储在game表中，所以这个方法只需要更新游戏记录
     */
    @Override
    public void associateUserWithGame(String userId, String gameId) {
        Game game = findById(gameId);
        if (game != null) {
            game.setUserId(userId);
            save(game);
        }
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
        // 注意：这个方法应该只在测试环境中使用
        // 实际生产环境中应该禁用或限制使用
        List<GameEntity> allGames = gameMapper.selectAll();
        List<String> ids = new ArrayList<>();
        for (GameEntity game : allGames) {
            ids.add(game.getId());
        }
        if (!ids.isEmpty()) {
            gameMapper.batchDelete(ids);
        }
    }

    /**
     * 获取游戏数量
     */
    @Override
    public long count() {
        return gameMapper.count();
    }

    /**
     * 分页查询游戏
     */
    public List<Game> findByPage(int page, int size) {
        int offset = (page - 1) * size;
        List<GameEntity> gameEntities = gameMapper.selectByPage(offset, size);
        return convertToModelList(gameEntities);
    }

    /**
     * 条件查询游戏
     */
    public List<Game> findByCondition(Map<String, Object> condition) {
        List<GameEntity> gameEntities = gameMapper.selectByCondition(condition);
        return convertToModelList(gameEntities);
    }

    /**
     * 搜索游戏
     */
    public List<Game> search(String keyword) {
        List<GameEntity> gameEntities = gameMapper.search(keyword);
        return convertToModelList(gameEntities);
    }

    /**
     * 检查游戏是否存在
     */
    public boolean existsById(String id) {
        return gameMapper.existsById(id);
    }

    /**
     * 检查游戏名称是否已存在
     */
    public boolean existsByName(String name) {
        // 注意：这个方法需要在GameMapper.xml中实现
        // 暂时使用条件查询实现
        Map<String, Object> condition = new HashMap<>();
        condition.put("name", name);
        condition.put("limit", 1);
        List<GameEntity> games = gameMapper.selectByCondition(condition);
        return !games.isEmpty();
    }

    /**
     * 获取游戏统计信息
     */
    public Map<String, Object> getStatistics() {
        return gameMapper.getStatistics();
    }

    /**
     * 获取用户游戏统计
     */
    public Map<String, Object> getUserGameStats(String userId) {
        return gameMapper.getUserGameStats(userId);
    }

    /**
     * 获取最近创建的游戏
     */
    public List<Game> getRecentGames(int limit) {
        List<GameEntity> gameEntities = gameMapper.getRecentGames(limit);
        return convertToModelList(gameEntities);
    }

    /**
     * 批量保存游戏
     */
    public void batchSave(List<Game> games) {
        List<GameEntity> gameEntities = new ArrayList<>();
        for (Game game : games) {
            gameEntities.add(convertToEntity(game));
        }
        gameMapper.batchInsert(gameEntities);
    }

    /**
     * 批量更新游戏
     */
    public void batchUpdate(List<Game> games) {
        List<GameEntity> gameEntities = new ArrayList<>();
        for (Game game : games) {
            gameEntities.add(convertToEntity(game));
        }
        gameMapper.batchUpdate(gameEntities);
    }

    /**
     * 批量删除游戏
     */
    public void batchDelete(List<String> ids) {
        gameMapper.batchDelete(ids);
    }

    /**
     * 将Game模型转换为GameEntity实体
     */

    /**
     * 将GameEntity实体转换为Game模型
     */

    /**
     * 将GameEntity列表转换为Game模型列表
     */
}

