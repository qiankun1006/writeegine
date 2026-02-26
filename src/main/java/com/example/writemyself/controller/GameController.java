package com.example.writemyself.controller;

import com.example.writemyself.service.UnityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 游戏管理控制器
 * 处理游戏类型选择门户相关的 API 请求
 */
@Controller
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private UnityService unityService;

    /**
     * 创建新游戏
     * POST /api/game/create
     * 参数: name (游戏名称), type (游戏类型), description (游戏描述)
     */
    @PostMapping("/create")
    @ResponseBody
    public Map<String, Object> createGame(
            @RequestParam(required = true) String name,
            @RequestParam(required = true) String type,
            @RequestParam(required = false) String description) {

        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> game = unityService.createGame(name, type, description != null ? description : "");
            response.put("success", true);
            response.put("data", game);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取游戏列表
     * GET /api/game/list
     * 可选参数: type (游戏类型，不提供则返回所有)
     */
    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> getGameList(
            @RequestParam(required = false) String type) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> games;
            if (type != null && !type.isEmpty()) {
                games = unityService.getGamesByType(type);
            } else {
                games = unityService.getGameList();
            }

            response.put("success", true);
            response.put("total", games.size());
            response.put("games", games);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取游戏详情
     * GET /api/game/{gameId}
     */
    @GetMapping("/{gameId}")
    @ResponseBody
    public Map<String, Object> getGame(@PathVariable String gameId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> game = unityService.getGame(gameId);
            if (game != null) {
                response.put("success", true);
                response.put("data", game);
            } else {
                response.put("success", false);
                response.put("error", "游戏不存在");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 保存游戏
     * POST /api/game/{gameId}/save
     * 请求体: JSON 格式的游戏数据
     */
    @PostMapping("/{gameId}/save")
    @ResponseBody
    public Map<String, Object> saveGame(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> gameData) {

        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> game = unityService.saveGame(gameId, gameData);
            if (game != null) {
                response.put("success", true);
                response.put("data", game);
            } else {
                response.put("success", false);
                response.put("error", "游戏不存在");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取游戏的场景列表
     * GET /api/game/{gameId}/scenes
     *
     * 注: 该 API 将在后续与场景管理进行集成
     * 现在返回空列表作为占位符
     */
    @GetMapping("/{gameId}/scenes")
    @ResponseBody
    public Map<String, Object> getGameScenes(@PathVariable String gameId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> game = unityService.getGame(gameId);
            if (game != null) {
                response.put("success", true);
                response.put("gameId", gameId);
                response.put("scenes", new ArrayList<>()); // 占位符
            } else {
                response.put("success", false);
                response.put("error", "游戏不存在");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 删除游戏
     * DELETE /api/game/{gameId}
     */
    @DeleteMapping("/{gameId}")
    @ResponseBody
    public Map<String, Object> deleteGame(@PathVariable String gameId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean deleted = unityService.deleteGame(gameId);
            if (deleted) {
                response.put("success", true);
                response.put("message", "游戏已删除");
            } else {
                response.put("success", false);
                response.put("error", "游戏不存在");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}

