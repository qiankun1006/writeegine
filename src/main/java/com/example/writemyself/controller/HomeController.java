package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Controller
public class HomeController {

    /**
     * 首页 - 游戏创作平台门户
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("title", "WriteMyself - 游戏创作平台");
        return "index";
    }

    /**
     * 创作游戏目录页面
     * 显示两个功能入口：地图编辑和图片编辑
     */
    @GetMapping("/create-game")
    public String createGame(Model model) {
        model.addAttribute("title", "创作游戏");
        return "create-game";
    }

    /**
     * Tilemap 地图编辑页面
     * 在此页面中嵌入完整的 Tilemap 编辑器
     */
    @GetMapping("/create-game/tilemap")
    public String createGameTilemap(Model model) {
        model.addAttribute("title", "地图编辑 - 创作游戏");

        // 为嵌入的 Tilemap 编辑器准备数据（与 TilemapEditorController 相同）
        List<String> tileImages = new ArrayList<>(Arrays.asList(
            "brown.png",           // 棕色地块
            "green.png",           // 绿色地块
            "green2.png",          // 绿色地块2
            "obstacle.png",        // 障碍物
            "stone-wall.png",      // 石墙
            "stone.png",           // 石头
            "stone2.png"           // 石头2
        ));

        // 定义对应的图块显示名称（中文）
        List<String> tileNames = new ArrayList<>(Arrays.asList(
            "棕色地块",
            "绿色地块",
            "绿色地块2",
            "障碍物",
            "石墙",
            "石头",
            "石头2"
        ));

        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("defaultGridSize", 16);

        return "create-game-tilemap";
    }

    /**
     * 图片编辑页面
     * 显示图片编辑器（开发中）
     */
    @GetMapping("/create-game/image")
    public String createGameImage(Model model) {
        model.addAttribute("title", "图片编辑 - 创作游戏");
        return "create-game-image";
    }

    /**
     * 游戏素材创作页面
     * 提供完整的游戏资源编辑系统：角色、地图、UI、特效等
     */
    @GetMapping("/create-game/asset")
    public String createGameAsset(Model model) {
        model.addAttribute("title", "游戏素材创作 - 创作游戏");

        // 为嵌入的 Tilemap 编辑器准备数据（用于战棋网格地图编辑）
        List<String> tileImages = new ArrayList<>(Arrays.asList(
            "brown.png",           // 棕色地块
            "green.png",           // 绿色地块
            "green2.png",          // 绿色地块2
            "obstacle.png",        // 障碍物
            "stone-wall.png",      // 石墙
            "stone.png",           // 石头
            "stone2.png"           // 石头2
        ));

        // 定义对应的图块显示名称（中文）
        List<String> tileNames = new ArrayList<>(Arrays.asList(
            "棕色地块",
            "绿色地块",
            "绿色地块2",
            "障碍物",
            "石墙",
            "石头",
            "石头2"
        ));

        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("defaultGridSize", 16);

        return "create-game-asset";
    }

    /**
     * Java 代码编辑器页面
     * 在线代码编辑、文件管理、代码索引功能
     */
    @GetMapping("/create-game/code")
    public String createGameCode(Model model) {
        model.addAttribute("title", "Java 代码编辑器 - 创作游戏");
        return "create-game-code";
    }

    /**
     * 我的游戏列表
     */
    @GetMapping("/my-games")
    public String myGames(Model model) {
        model.addAttribute("title", "我的游戏");
        // TODO: 从数据库加载用户的游戏列表
        // model.addAttribute("games", gameService.getUserGames());
        return "my-games";
    }

    /**
     * 游戏广场
     */
    @GetMapping("/game-plaza")
    public String gamePlaza(Model model) {
        model.addAttribute("title", "游戏广场");
        // TODO: 从数据库加载已发布的游戏
        // model.addAttribute("sharedGames", gameService.getPublishedGames());
        return "game-plaza";
    }

    /**
     * 关于我们（保留）
     */
    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("title", "关于我们");
        return "about";
    }

    /**
     * Favicon 处理
     * 浏览器自动请求 /favicon.ico，我们将其重定向到 SVG 版本
     */
    @GetMapping("/favicon.ico")
    public RedirectView favicon() {
        return new RedirectView("/static/images/favicon.svg");
    }
}

