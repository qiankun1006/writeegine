package com.example.writemyself.mapper;

import com.example.writemyself.model.Game;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Game数据访问Mapper接口
 * 使用MyBatis注解和XML混合模式
 */
@Mapper
@Repository
public interface GameMapper {

    /**
     * 根据ID查询游戏
     */
    @Select("SELECT * FROM game WHERE id = #{id}")
    @Results(id = "gameResultMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "name", column = "name"),
            @Result(property = "type", column = "type"),
            @Result(property = "description", column = "description"),
            @Result(property = "thumbnailUrl", column = "thumbnail_url"),
            @Result(property = "config", column = "config"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at")
    })
    Game selectById(@Param("id") String id);

    /**
     * 查询所有游戏
     */
    @Select("SELECT * FROM game ORDER BY created_at DESC")
    @ResultMap("gameResultMap")
    List<Game> selectAll();

    /**
     * 根据用户ID查询游戏
     */
    @Select("SELECT * FROM game WHERE user_id = #{userId} ORDER BY created_at DESC")
    @ResultMap("gameResultMap")
    List<Game> selectByUserId(@Param("userId") String userId);

    /**
     * 根据类型查询游戏
     */
    @Select("SELECT * FROM game WHERE type = #{type} ORDER BY created_at DESC")
    @ResultMap("gameResultMap")
    List<Game> selectByType(@Param("type") String type);

    /**
     * 插入游戏
     */
    @Insert("INSERT INTO game (id, name, type, description, thumbnail_url, config, user_id, created_at, updated_at) " +
            "VALUES (#{id}, #{name}, #{type}, #{description}, #{thumbnailUrl}, #{config}, #{userId}, #{createdAt}, #{updatedAt})")
    int insert(Game game);

    /**
     * 更新游戏
     */
    @Update("UPDATE game SET " +
            "name = #{name}, " +
            "type = #{type}, " +
            "description = #{description}, " +
            "thumbnail_url = #{thumbnailUrl}, " +
            "config = #{config}, " +
            "user_id = #{userId}, " +
            "updated_at = #{updatedAt} " +
            "WHERE id = #{id}")
    int update(Game game);

    /**
     * 删除游戏
     */
    @Delete("DELETE FROM game WHERE id = #{id}")
    int deleteById(@Param("id") String id);

    /**
     * 统计游戏数量
     */
    @Select("SELECT COUNT(*) FROM game")
    long count();

    /**
     * 根据用户ID统计游戏数量
     */
    @Select("SELECT COUNT(*) FROM game WHERE user_id = #{userId}")
    long countByUserId(@Param("userId") String userId);

    /**
     * 检查游戏是否存在
     */
    @Select("SELECT COUNT(*) FROM game WHERE id = #{id}")
    boolean existsById(@Param("id") String id);

    /**
     * 分页查询游戏
     * 使用XML映射实现复杂查询
     */
    List<Game> selectByPage(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 条件查询游戏
     * 使用XML映射实现动态SQL
     */
    List<Game> selectByCondition(Map<String, Object> condition);

    /**
     * 批量插入游戏
     * 使用XML映射实现批量操作
     */
    int batchInsert(List<Game> games);

    /**
     * 批量更新游戏
     * 使用XML映射实现批量操作
     */
    int batchUpdate(List<Game> games);

    /**
     * 批量删除游戏
     * 使用XML映射实现批量操作
     */
    int batchDelete(List<String> ids);

    /**
     * 搜索游戏（根据名称或描述）
     * 使用XML映射实现全文搜索
     */
    List<Game> search(@Param("keyword") String keyword);

    /**
     * 获取游戏统计信息
     * 使用XML映射实现复杂统计
     */
    Map<String, Object> getStatistics();

    /**
     * 获取用户游戏统计
     * 使用XML映射实现用户统计
     */
    Map<String, Object> getUserGameStats(@Param("userId") String userId);

    /**
     * 获取最近创建的游戏
     * 使用XML映射实现排序查询
     */
    List<Game> getRecentGames(@Param("limit") int limit);

    /**
     * 根据条件统计游戏数量
     * 使用XML映射实现动态统计
     */
    long countByCondition(Map<String, Object> condition);
}

