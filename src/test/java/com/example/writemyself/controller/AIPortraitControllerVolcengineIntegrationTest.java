package com.example.writemyself.controller;

import com.example.writemyself.dto.GeneratePortraitRequest;
import com.example.writemyself.dto.GeneratePortraitResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AIPortraitControllerVolcengineIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAcceptVolcengineModelRequest() throws Exception {
        // 构建火山引擎模型请求
        GeneratePortraitRequest request = new GeneratePortraitRequest();
        request.setPrompt("test prompt for volcengine");
        request.setModelVersion("doubao-seedream-5-0-260128");
        request.setWidth(512);
        request.setHeight(512);
        request.setCount(1);

        // 发送请求
        MvcResult result = mockMvc.perform(post("/api/ai/portrait/generate")
                .header("X-User-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andReturn();

        // 验证响应
        String responseContent = result.getResponse().getContentAsString();
        GeneratePortraitResponse response = objectMapper.readValue(responseContent,
            GeneratePortraitResponse.class);

        assertNotNull(response.getTaskId());
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void shouldFallbackToDefaultModelWhenUnknownModelSpecified() throws Exception {
        // 构建未知模型请求
        GeneratePortraitRequest request = new GeneratePortraitRequest();
        request.setPrompt("test prompt");
        request.setModelVersion("unknown-model");
        request.setWidth(512);
        request.setHeight(512);
        request.setCount(1);

        // 发送请求
        MvcResult result = mockMvc.perform(post("/api/ai/portrait/generate")
                .header("X-User-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andReturn();

        // 验证响应 - 应该成功，使用默认模型
        String responseContent = result.getResponse().getContentAsString();
        GeneratePortraitResponse response = objectMapper.readValue(responseContent,
            GeneratePortraitResponse.class);

        assertNotNull(response.getTaskId());
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void shouldValidateRequiredParametersForVolcengineModel() throws Exception {
        // 构建缺少必要参数的请求
        GeneratePortraitRequest request = new GeneratePortraitRequest();
        request.setModelVersion("doubao-seedream-5-0-260128");
        // 缺少prompt、width、height

        // 发送请求 - 应该返回400错误
        mockMvc.perform(post("/api/ai/portrait/generate")
                .header("X-User-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

