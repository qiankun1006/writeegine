/openspec/proposal   我现在会引入字节火山引擎：在调用前，请确保已安装火山引擎SDK，并将该SDK升级到最新版本更多信息请查看

SDK指南

1. 请按如下命令安装环境

<dependency>
    <groupId>com.volcengine</groupId>
    <artifactId>volcengine-java-sdk-ark-runtime</artifactId>
    <version>1.0.13</version> 、、、最新的
</dependency>

复制

2. 文生图-生成单张图

package com.volcengine.ark.runtime;

import com.volcengine.ark.runtime.model.images.generation.GenerateImagesRequest;

import com.volcengine.ark.runtime.model.images.generation.ImagesResponse;

import com.volcengine.ark.runtime.model.images.generation.ResponseFormat;

import com.volcengine.ark.runtime.model.images.generation.Size;

import com.volcengine.ark.runtime.service.ArkService;

import okhttp3.ConnectionPool;

import okhttp3.Dispatcher;

import java.util.Arrays;

import java.util.List;

import java.util.concurrent.TimeUnit;

public class ImageGenerationsExample {

    public static void main(String[] args) {

        String apiKey = System.getenv("ARK_API_KEY");

        ConnectionPool connectionPool = new ConnectionPool(5, 1, TimeUnit.SECONDS);

        Dispatcher dispatcher = new Dispatcher();

        ArkService service = ArkService.builder().dispatcher(dispatcher).connectionPool(connectionPool).apiKey(apiKey).build();

        GenerateImagesRequest generateRequest = GenerateImagesRequest.builder()
                .model("doubao-seedream-5-0-260128")
                .prompt("星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影，强引力，吞噬")
                .size("2K")
                .sequentialImageGeneration("disabled")
                .responseFormat(ResponseFormat.Url)
                .stream(false)
                .watermark(true)
                .build();

        ImagesResponse imagesResponse = service.generateImages(generateRequest);

        System.out.println(imagesResponse.getData().get(0).getUrl());

        service.shutdownExecutor();

    }

}

